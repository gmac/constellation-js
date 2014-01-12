describe("Constellation Grid", function() {
	
	// Environment config...
	var grid;
	var n0 = 'n0';
	var n1 = 'n1';
	var n2 = 'n2';
		
	function numConnections( id ) {
		return _.size( grid.getNodeById( id ).to );
	}

	function getConnection( a, b ) {
		return grid.getNodeById( a ).to[ b ];
	}
	
	beforeEach(function() {
		grid = new Const.Grid();
	});
	
	afterEach(function() {
		// do nothing.
	});
	
	it("addNode: should add a new node with specified X and Y coordinates, and return it.", function() {
		var x = 55;
		var y = 71;
		var id = grid.addNode(x, y).id;
		
		// Check that an ID was returned.
		expect( id ).not.to.be.empty;
		
		// Check that a node was added.
		expect( grid.getNumNodes() ).to.equal(1);
		
		// Check that its coordinates are set.
		expect( grid.getNodeById(id).x ).to.equal(x);
		expect( grid.getNodeById(id).y ).to.equal(y);
	});
	
	it("addNode: should add a new node without specified coordinates, which defaults to point [0,0].", function() {
		var id = grid.addNode().id;
		
		// One node should have been added.
		expect( grid.getNumNodes() ).to.equal(1);
		
		// Its X and Y coordinates should default to zero.
		expect( grid.getNodeById(id).x ).to.equal(0);
		expect( grid.getNodeById(id).y ).to.equal(0);
	});
	
	it("getNodeById: should get a single node by id reference.", function() {
		var node = grid.addNode();
		var fetch = grid.getNodeById(node.id);
		expect(fetch).to.equal(node);
	});
	
	it("getNodesForIds: should get an array of nodes for each provided id argument.", function() {
		var a = grid.addNode();
		var b = grid.addNode();
		var fetch = grid.getNodes(a.id, b.id);
			
		expect(fetch[0]).to.equal(a);
		expect(fetch[1]).to.equal(b);
	});
	
	it("getNodesForIds: should get an array of nodes for an array of id references.", function() {
		var a = grid.addNode();
		var b = grid.addNode();
		var fetch = grid.getNodes([a.id, b.id]);
			
		expect(fetch[0]).to.equal(a);
		expect(fetch[1]).to.equal(b);
	});
	
	it("hasNodes: should validate that multiple node id arguments are defined.", function() {
		var a = grid.addNode();
		var b = grid.addNode();
		var found = grid.hasNodes(a.id, b.id);
		expect(found).not.to.be.empty;
	});
	
	it("hasNodes: should validate that an array of node ids are defined.", function() {
		var a = grid.addNode();
		var b = grid.addNode();
		var found = grid.hasNodes([a.id, b.id]);
		expect(found).not.to.be.empty;
	});
	
	it("joinNodes: should join multiple node ids, provided as arguments.", function() {
		var a = grid.addNode(0, 0).id;
		var b = grid.addNode(100, 100).id;
		
		grid.joinNodes(a, b);
		
		// Each node should have one connection.
		expect( numConnections(a) ).to.equal(1);
		expect( numConnections(b) ).to.equal(1);
		
		// Each node should have a reference to one another.
		expect( getConnection(a, b) ).not.to.be.empty;
		expect( getConnection(b, a) ).not.to.be.empty;
	});
	
	it("joinNodes: should join multiple node ids, provided as an array.", function() {
		var a = grid.addNode(0, 0).id;
		var b = grid.addNode(100, 100).id;
		
		grid.joinNodes([a, b]);
		
		// Each node should have one connection.
		expect( numConnections(a) ).to.equal(1);
		expect( numConnections(b) ).to.equal(1);
		
		// Each node should have a reference to one another.
		expect( getConnection(a, b) ).not.to.be.empty;
		expect( getConnection(b, a) ).not.to.be.empty;
	});
	
	it("joinNodes: should join multiple node ids, creating connections between all references.", function() {
		var a = grid.addNode(0, 0).id;
		var b = grid.addNode(100, 100).id;
		var c = grid.addNode(100, 200).id;
			
		grid.joinNodes(a, b, c);
		
		// Each node should now have two connections:
		_.each(grid.nodes, function(node) {
			expect(numConnections(node.id)).to.equal(2);
		});
	});
	
	it("joinNodes: should defer action when joining less than two nodes.", function() {
		var id = grid.addNode().id;
		
		grid.joinNodes(id); // << takes no action.
		grid.joinNodes([id]); // << takes no action.
		
		// Expect no connections to have been made.
		expect( numConnections(id) ).to.equal(0);
	});
	
	it("joinNodes: should defer action when joining a group with invalid node references.", function() {
		var valid = grid.addNode().id;
		grid.joinNodes(valid, 'invalid'); // << takes no action.
		grid.joinNodes([valid, 'invalid']); // << takes no action.
		
		expect( numConnections(valid) ).to.equal(0);
	});
	
	it("splitNodes: should split multiple connected node ids, provided as arguments.", function() {
		var a = grid.addNode(0, 0).id;
		var b = grid.addNode(100, 100).id;
		var c = grid.addNode(100, 200).id;
		grid.joinNodes(a, b, c);
		
		// Exclude last node, then split the other two.
		grid.splitNodes(a, b);
		
		// First two nodes should now have one connection, third node should still have two.
		expect( numConnections(a) ).to.equal(1);
		expect( numConnections(b) ).to.equal(1);
		expect( numConnections(c) ).to.equal(2);
		
		// Remaining connection on the first two nodes should be to the third.
		expect( getConnection(a, c) ).not.to.be.empty;
		expect( getConnection(a, c) ).not.to.be.empty;
	});
	
	it("splitNodes: should split multiple connected node ids, provided as an array.", function() {
		var a = grid.addNode(0, 0).id;
		var b = grid.addNode(100, 100).id;
		var c = grid.addNode(100, 200).id;
		grid.joinNodes([a, b, c]);
		
		// Exclude last node, then split the other two.
		grid.splitNodes([a, b]);
		
		// First two nodes should now have one connection, third node should still have two.
		expect( numConnections(a) ).to.equal(1);
		expect( numConnections(b) ).to.equal(1);
		expect( numConnections(c) ).to.equal(2);
		
		// Remaining connection on the first two nodes should be to the third.
		expect( getConnection(a, c) ).not.to.be.empty;
		expect( getConnection(a, c) ).not.to.be.empty;
	});
	
	it("splitNodes: should defer action when splitting unconnected nodes.", function() {
		var a = grid.addNode(0, 0).id;
		var b = grid.addNode(100, 100).id;
		var c = grid.addNode(100, 200).id;
		
		// Join two nodes.
		grid.joinNodes(a, b);
			
		function testNumConnections() {
			expect( numConnections(a) ).to.equal(1);
			expect( numConnections(b) ).to.equal(1);
			expect( numConnections(c) ).to.equal(0);
		}
			
		testNumConnections();
		grid.splitNodes(a, c); // << takes no action.
		testNumConnections();
	});
	
	it("splitNodes: should completely detach a single node from all connections while splitting.", function() {
		var a = grid.addNode(0, 0).id;
		var b = grid.addNode(100, 100).id; 
		var c = grid.addNode(100, 200).id;
		grid.joinNodes(a, b, c);
		grid.splitNodes(a);
		
		expect( numConnections(a) ).to.equal(0);
		expect( numConnections(b) ).to.equal(1);
		expect( numConnections(c) ).to.equal(1);
	});
	
	it("detachNodes: should detach all connections from a group of node ids, provided as arguments.", function() {
		var a = grid.addNode(0, 0).id;
		var b = grid.addNode(100, 100).id;
		var c = grid.addNode(100, 200).id;
		var d = grid.addNode(100, 200).id;
		grid.joinNodes(a, b, c, d);
		grid.detachNodes(a, b);
		
		expect( numConnections(a) ).to.equal(0);
		expect( numConnections(b) ).to.equal(0);
		expect( numConnections(c) ).to.equal(1);
		expect( numConnections(d) ).to.equal(1);
	});
	
	it("detachNodes: should detach all connections from a group of node ids, provided as an array.", function() {
		var a = grid.addNode().id;
		var b = grid.addNode().id;
		var c = grid.addNode().id;
		var d = grid.addNode().id;
		grid.joinNodes([a, b, c, d]);
		grid.detachNodes([a, b]);
		
		expect( numConnections(a) ).to.equal(0);
		expect( numConnections(b) ).to.equal(0);
		expect( numConnections(c) ).to.equal(1);
		expect( numConnections(d) ).to.equal(1);
	});
	
	it("removeNodes: should remove a group of node ids, provided as arguments.", function() {
		var a = grid.addNode().id;
		var b = grid.addNode().id;
		var c = grid.addNode().id;
		
		// Expect two nodes in the model.
		expect( grid.getNumNodes() ).to.equal(3);
		
		// Remove node A, and a second invalid reference.
		grid.removeNodes(a, b);
		
		// Expect A to have been removed, and the invalid reference to have been ignored.
		expect( grid.getNumNodes() ).to.equal(1);
		expect( grid.nodes[c] ).not.to.be.empty;
	});
	
	it("removeNodes: should remove a group of node ids, provided as an array.", function() {
		var a = grid.addNode().id;
		var b = grid.addNode().id;
		var c = grid.addNode().id;
		
		// Expect two nodes in the model.
		expect( grid.getNumNodes() ).to.equal(3);
		
		// Remove node A, and a second invalid reference.
		grid.removeNodes([a, b]);
		
		// Expect A to have been removed, and the invalid reference to have been ignored.
		expect( grid.getNumNodes() ).to.equal(1);
		expect( grid.nodes[c] ).not.to.be.empty;
	});
	
	it("removeNodes: should detach connections while removing nodes.", function() {
		var a = grid.addNode().id;
		var b = grid.addNode().id;
		var c = grid.addNode().id;
		var d = grid.addNode().id;
		
		// Expect four nodes in the model.
		expect( grid.getNumNodes() ).to.equal(4);
		
		// Join all nodes, then confirm they each have three connections.
		grid.joinNodes(a, b, c, d);
		
		// Remove nodes A and B.
		grid.removeNodes(a, b);
		
		// Confirm that there are now two nodes, each now with only one connection.
		expect( grid.getNumNodes() ).to.equal(2);
		expect( numConnections(c) ).to.equal(1);
		expect( numConnections(d) ).to.equal(1);
		
		// Confirm that C and D are still connected to one another.
		expect( getConnection(c, d) ).not.to.be.empty;
		expect( getConnection(d, c) ).not.to.be.empty;
	});
	
	it("removeNodes: should defer action when removing an invalid node reference.", function() {
		var a = grid.addNode().id;
		var b = grid.addNode().id;
		
		// Expect two nodes in the model.
		expect( grid.getNumNodes() ).to.equal(2);
		
		// Remove node A, and a second invalid reference.
		grid.removeNodes(a, 'invalid');
		
		// Expect A to have been removed, and the invalid reference to have been ignored.
		expect( grid.getNumNodes() ).to.equal(1);
	});
	
	it("removeNodes: should remove all dependent polygons while removing a node.", function() {
		var a = grid.addNode().id;
		var b = grid.addNode().id;
		var c = grid.addNode().id;
		var p = grid.addPolygon([a, b, c]);
		
		// Expect a polygon to have been created:
		expect( grid.getNumPolygons() ).to.equal(1);
		
		// Remove nodes from polygon:
		grid.removeNodes(a, b);
		
		// Expect polygon to have been removed:
		expect( grid.getNumPolygons() ).to.equal(0);
	});
	
	it("addPolygon: should create a polygon from a group of nodes, and return it.", function() {
		var a = grid.addNode().id;
		var b = grid.addNode().id;
		var c = grid.addNode().id;
		var p = grid.addPolygon([a, b, c]);

		expect( grid.getNumPolygons() ).to.equal(1);
		expect( p.nodes.length ).to.equal(3);
	});
	
	it("addPolygon: should defer action when creating a polygon with less than three nodes.", function() {
		var a = grid.addNode().id;
		var b = grid.addNode().id;
		var p = grid.addPolygon([a, b]); // << takes no action.
    
		expect( p ).to.be.null;
		expect( grid.getNumPolygons() ).to.equal(0);
	});
	
	it("addPolygon: should defer action when creating a polygon with an invalid node reference.", function() {
		var a = grid.addNode().id;
		var b = grid.addNode().id;
		var p = grid.addPolygon( [a, b, 'sfoo'] ); // << takes no action.

		expect( p ).to.be.null;
		expect( grid.getNumPolygons() ).to.equal(0);
	});
	
	it("getPolygonById: should get a single polygon by id reference.", function() {
		var a = grid.addNode().id;
		var b = grid.addNode().id;
		var c = grid.addNode().id;
		var p = grid.addPolygon( [a, b, c] );
		
		expect( grid.getPolygonById(p.id) ).to.equal( p );
	});
	
	it("getNodesForPolygon: should get an array of nodes for a polygon reference.", function() {
		var a = grid.addNode();
		var b = grid.addNode();
		var c = grid.addNode();
		var p = grid.addPolygon( [a.id, b.id, c.id] ).id;
		var nodes = grid.getNodesForPolygon(p);
			
		expect( nodes[0] ).to.equal( a );
		expect( nodes[1] ).to.equal( b );
		expect( nodes[2] ).to.equal( c );
	});
	
	it("removePolygons: should remove multiple polygon ids, provided as arguments.", function() {
		var a = grid.addNode().id;
		var b = grid.addNode().id;
		var c = grid.addNode().id;
		var p1 = grid.addPolygon([a, b, c]).id;
		var p2 = grid.addPolygon([a, b, c]).id;
		
		
		expect( grid.getNumPolygons() ).to.equal(2);
		grid.removePolygons( p1, p2 );
		expect( grid.getNumPolygons() ).to.equal(0);
	});
	
	it("removePolygons: should remove multiple valid polygon ids, provided as an array.", function() {
		var a = grid.addNode().id;
		var b = grid.addNode().id;
		var c = grid.addNode().id;
		var p1 = grid.addPolygon([a, b, c]).id;
		var p2 = grid.addPolygon([a, b, c]).id;
		
		
		expect( grid.getNumPolygons() ).to.equal(2);
		grid.removePolygons([p1, p2]);
		expect( grid.getNumPolygons() ).to.equal(0);
	});
	
	it("removePolygons: should defer action when removing an invalid polygon reference.", function() {
		var a = grid.addNode().id;
		var b = grid.addNode().id;
		var c = grid.addNode().id;
		var p1 = grid.addPolygon([a, b, c]).id;
		var p2 = grid.addPolygon([a, b, c]).id;
			
		expect( grid.getNumPolygons() ).to.equal(2);
		grid.removePolygons(p1, 'invalid');
		expect( grid.getNumPolygons() ).to.equal(1);
	});
	
	it("findPath: should find a path between two joined nodes.", function() {
		var a = grid.addNode(0, 0);
		var b = grid.addNode(0, 100);
		grid.joinNodes(a.id, b.id);
		
		var result = grid.findPath(a.id, b.id);
		
		expect( result.valid ).not.to.be.empty;
		expect( result.nodes[0] ).to.equal( a );
		expect( result.nodes[1] ).to.equal( b );
	});
	
	it("findPath: should find a path between two nodes across a network of joined nodes.", function() {
		var a = grid.addNode(0, 0);
		var b = grid.addNode(0, 100);
		var c = grid.addNode(0, 200);
			
		grid.joinNodes(a.id, b.id);
		grid.joinNodes(b.id, c.id);
		var result = grid.findPath(a.id, c.id);
		
		expect( result.valid ).not.to.be.empty;
		expect( result.nodes[0] ).to.equal( a );
		expect( result.nodes[1] ).to.equal( b );
		expect( result.nodes[2] ).to.equal( c );
	});
	
	it("findPath: should fail to find a path between two nodes in unconnected grid fragments.", function() {
		var a = grid.addNode(0, 0);
		var b = grid.addNode(0, 100);
		var c = grid.addNode(0, 200);
		grid.joinNodes(a.id, b.id);
		
		var result = grid.findPath(a.id, c.id);
		
		expect( result.valid ).to.be.empty;
		expect( result.nodes.length ).to.equal( 0 );
	});
	
	it("findPath: should find the shortest path between two nodes by default, regardless of connection count.", function() {
		var a = grid.addNode(0, 0).id;
		var b = grid.addNode(25, 0).id;
		var c = grid.addNode(75, 0).id;
		var d = grid.addNode(100, 0).id;
		var e = grid.addNode(50, 100).id;
			
		grid.joinNodes(a, b);
		grid.joinNodes(b, c);
		grid.joinNodes(c, d);
		grid.joinNodes(a, e);
		grid.joinNodes(e, d);
		
		var result = grid.findPath(a, d);

		expect( result.valid ).not.to.be.empty;
		expect( result.weight ).to.equal( 100 );
		expect( result.nodes.length ).to.equal( 4 );
	});
	
	it("findPath: should allow custom grid searches using weighting, estimating, and prioratizing functions.", function() {
		var a = grid.addNode(0, 0, {weight: 2}).id;
		var b = grid.addNode(25, 0, {weight: 3}).id;
		var c = grid.addNode(75, 0, {weight: 3}).id;
		var d = grid.addNode(100, 0, {weight: 2}).id;
		var e = grid.addNode(50, 100, {weight: 2}).id;
			
		grid.joinNodes(a, b);
		grid.joinNodes(b, c);
		grid.joinNodes(c, d);
		grid.joinNodes(a, e);
		grid.joinNodes(e, d);
		
		var result = grid.findPath(a, d, function( lastNode, currentNode ) {
			return currentNode.data.weight;
		}, function( currentNode, goalNode ) {
			return goalNode.data.weight;
		});

		expect( result.valid ).not.to.be.empty;
		expect( result.weight ).to.equal( 6 );
		expect( result.nodes.length ).to.equal( 3 );
	});
	
	it("findPathWithFewestNodes: should find a path between two points with the fewest possible nodes connections.", function() {
		var a = grid.addNode(0, 0).id;
		var b = grid.addNode(25, 0).id;
		var c = grid.addNode(75, 0).id;
		var d = grid.addNode(100, 0).id;
		var e = grid.addNode(50, 100).id;
			
		grid.joinNodes(a, b);
		grid.joinNodes(b, c);
		grid.joinNodes(c, d);
		grid.joinNodes(a, e);
		grid.joinNodes(e, d);
		
		var result = grid.findPathWithFewestNodes(a, d);
		
		expect( result.valid ).not.to.be.empty;
		expect( result.weight ).to.equal( 3 );
		expect( result.nodes.length ).to.equal( 3 );
	});
	
	it("snapPointToGrid: should return a point snapped to the nearest grid line segment.", function() {
		var a = grid.addNode(0, 0).id;
		var b = grid.addNode(100, 0).id;
		grid.joinNodes(a, b);

		var snapped = grid.snapPointToGrid( {x:50, y:20} );

		expect( snapped.point.x ).to.equal( 50 );
		expect( snapped.point.y ).to.equal( 0 );
	});
	
	it("snapPointToGrid: should defer action when snapping a point to a grid with no nodes.", function() {
		var a = {x:50, y:20};
		var b = grid.snapPointToGrid(a);
		
		expect( b.point.x ).to.equal( a.x );
		expect( b.point.y ).to.equal( a.y );
	});
	
	it("snapPointToGrid: should defer action when snapping a point to a grid with no node connections.", function() {
		grid.addNode();
		grid.addNode();
		
		var a = {x:50, y:20};
		var b = grid.snapPointToGrid(a);
		
		expect( b.point.x ).to.equal( a.x );
		expect( b.point.y ).to.equal( a.y );
	});
	
	it("getNearestNodeToNode: should find the nearest node to the specified origin node.", function() {
		var a = grid.addNode(0, 0);
		var b = grid.addNode(100, 100);
		var c = grid.addNode(10, 10);
		var n = grid.getNearestNodeToNode( c.id );
		
		expect( n ).to.equal( a );
	});
	
	it("getNearestNodeToNode: should return null when an invalid origin node is referenced.", function() {
		var a = grid.addNode(0, 0);
		var b = grid.addNode(100, 100);
		var n = grid.getNearestNodeToNode( 'invalid' );
		
		expect( n ).to.equal( null );
	});
	
	it("getNearestNodeToNode: should return null when there are no other nodes besides the origin.", function() {
		var a = grid.addNode(0, 0);
		var n = grid.getNearestNodeToNode( a.id );
		
		expect( n ).to.equal( null );
	});
	
	it("getNearestNodeToPoint: should find the nearest node to the provided point.", function() {
		var a = grid.addNode(0, 0);
		var b = grid.addNode(100, 0);
		var n = grid.getNearestNodeToPoint( {x:10, y:0} );
		
		expect( n ).to.equal( a );
	});
	
	it("hitTestPointInPolygons: should return true if the specified point falls within any polygon, otherwise false.", function() {
		var a = grid.addNode(0, 0).id;
		var b = grid.addNode(100, 0).id; 
		var c = grid.addNode(0, 100).id;
		var d = grid.addNode(100, 100).id;
		var p1 = grid.addPolygon([a, b, c]);
		var p2 = grid.addPolygon([b, c, d]);
		
		expect( grid.hitTestPointInPolygons({x:10, y:10}) ).to.equal( true );
		expect( grid.hitTestPointInPolygons({x:90, y:90}) ).to.equal( true );
		expect( grid.hitTestPointInPolygons({x:200, y:200}) ).to.equal( false );
	});
	
	it("hitTestPointInPolygons: should return false when there are no polygons in the grid.", function() {
		expect( grid.hitTestPointInPolygons({x:10, y:10}) ).to.equal( false );
	});
	
	it("getPolygonsOverPoint: should return an array of all polygon ids hit by a point.", function() {
		var a = grid.addNode(0, 0).id;
		var b = grid.addNode(100, 0).id;
		var c = grid.addNode(0, 100).id;
		var d = grid.addNode(100, 100).id;
		var p1 = grid.addPolygon( [a, b, c] );
		var p2 = grid.addPolygon( [a, c, d] );
		var hit1 = grid.getPolygonsOverPoint({x:5, y:50});
		var hit2 = grid.getPolygonsOverPoint({x:50, y:5});
		var hit3 = grid.getPolygonsOverPoint({x:95, y:50});
			
		expect( hit1.length ).to.equal( 2 );
		expect( hit2.length ).to.equal( 1 );
		expect( hit3.length ).to.equal( 0 );
	});
	
	it("getNodesInPolygon: should return an array of all node ids contained within a polygon.", function() {
		var a = grid.addNode(0, 0).id;
		var b = grid.addNode(100, 0).id;
		var c = grid.addNode(0, 100).id;
		var d = grid.addNode(50, 25).id; // Inside figure ABC
		var e = grid.addNode(200, 200).id; // Outside figure ABC
		
		// Create figure ABC and get node hits:
		var p = grid.addPolygon( [a, b, c] ).id;
		var hits = grid.getNodesInPolygon( p );
		
		// Should get all nodes composing ABC, and contained point D.
		expect( hits.length ).to.equal( 4 );
		expect( hits.sort().join() ).to.equal( [a, b, c, d].sort().join() );
	});
	
	it("getAdjacentPolygonSegments: should return an array specifying an adjacent line segment.", function() {
		var a = grid.addNode(0, 0).id;
		var b = grid.addNode(100, 0).id;
		var c = grid.addNode(0, 100).id;
		var d = grid.addNode(100, 100).id;
		
		// Create figures ABC and ACD:
		var p1 = grid.addPolygon( [a, b, c] ).id;
		var p2 = grid.addPolygon( [a, c, d] ).id;
		var segments = grid.getAdjacentPolygonSegments(p1, p2);
		
		expect( segments ).to.have.length( 1 );
		expect( segments[0] ).to.contain(a, c);
	});
	
	it("getAdjacentPolygonSegments: should find all adjacent line segments in interlocking polygons.", function() {
		var a = grid.addNode(0, 0).id;
		var b = grid.addNode(50, 50).id;
		var c = grid.addNode(0, 100).id;
		var d = grid.addNode(100, 50).id;
		
		// Create figures ABC and ACD:
		var p1 = grid.addPolygon( [a, b, c] ).id;
		var p2 = grid.addPolygon( [a, d, c, b] ).id;
		var segments = grid.getAdjacentPolygonSegments(p1, p2);
		
		expect( segments ).to.have.length( 2 );
		expect( segments[0] ).to.include.members([a, b]);
		expect( segments[1] ).to.include.members([b, c]);
	});
	
	it("getNodesInRect: should return an array of all node ids contained within a rectangle.", function() {
		var a = grid.addNode(0, 0).id;
		var b = grid.addNode(50, 50).id;
		var c = grid.addNode(100, 100).id;
		var hits = grid.getNodesInRect( new Const.Rect(75, 75, -100, -100) );
			
		expect( hits.length ).to.equal( 2 );
		expect( hits.sort().join() ).to.equal( [a, b].sort().join() );
	});
	
	it('should test "getPolygonsWithLineSegment".');
	
	it('should use "getContiguousNodesMap" to return an array of contiguous node clusters.', function() {
		var a = grid.addNode(0, 0).id;
		var b = grid.addNode(50, 50).id;
		var c = grid.addNode(100, 100).id;
		var d = grid.addNode(150, 150).id;
		grid.joinNodes(a, b);
		grid.joinNodes(c, d);
		var fragments = grid.getContiguousNodesMap();

		expect(fragments).to.have.length(2);
		expect(fragments[0]).to.contain.keys(a, b);
		expect(fragments[1]).to.contain.keys(c, d);
	});
});


describe('bridgePoints', function() {
	
	// Environment config...
	var grid;
		
	function numConnections( id ) {
		return _.size( grid.getNodeById( id ).to );
	}
	
	chai.Assertion.addMethod('point', function(pt) {
	  new chai.Assertion(this._obj.x).to.equal(pt.x);
		new chai.Assertion(this._obj.y).to.equal(pt.y);
	});
	
	beforeEach(function() {
		grid = new Const.Grid();
		var a = grid.addNode(25, 25).id;
		var b = grid.addNode(75, 25).id;
		var c = grid.addNode(25, 75).id;
		var d = grid.addNode(75, 75).id;
		var e = grid.addNode(125, 25).id;
		
		grid.joinNodes(a, b, c);
		grid.joinNodes(b, c, d);
		grid.joinNodes(b, d, e);
		grid.addPolygon([a, b, c]);
		grid.addPolygon([b, c, d]);
	});
	
	afterEach(function() {
		// do nothing.
	});
	
	it("should directly conntect two points within a common polygon.", function() {
		// Connect two points within the same polygon:
		var start = {x:26, y:26};
		var goal = {x:28, y:28};
		var path = grid.bridgePoints(start, goal);
		
		// Expect direct connection (start >> goal).
		expect( path.length ).to.equal( 2 );
		expect( path[0] ).to.be.point( start );
		expect( path[1] ).to.be.point( goal );
	});
	
	it("should directly connect two points in adjacent polygons who's ray intersects their common side.", function() {
		// Connect two points within the same polygon:
		var start = {x:26, y:26};
		var goal = {x:74, y:74};
		var path = grid.bridgePoints(start, goal);
		
		// Expect direct connection (start >> goal).
		expect( path.length ).to.equal( 2 );
		expect( path[0] ).to.be.point( start );
		expect( path[1] ).to.be.point( goal );
	});
	
	it('should snap a point to a grid segment, then directly connect it to a point within a related polygon.', function() {
		var start = {x:20, y:50};
		var goal = {x:26, y:26};
		var path = grid.bridgePoints(start, goal);
		
		expect( path.length ).to.equal( 3 );
		expect( path[0] ).to.be.point( start );
		expect( path[1] ).to.be.point( {x:25, y:50} );
		expect( path[2] ).to.be.point( goal );
	});
	
	it('should snap points to a grid segment, then directly connect them through a common polygon.', function() {
		var start = {x:20, y:50};
		var goal = {x:50, y:20};
		var path = grid.bridgePoints(start, goal);
		
		expect( path.length ).to.equal( 4 );
		expect( path[0] ).to.be.point( start );
		expect( path[1] ).to.be.point( {x:25, y:50} );
		expect( path[2] ).to.be.point( {x:50, y:25} );
		expect( path[3] ).to.be.point( goal );
	});
	
	it('should snap points to a grid segment, then directly connect them along a common line segment.', function() {
		var start = {x:100, y:20};
		var goal = {x:110, y:20};
		var path = grid.bridgePoints(start, goal);
		
		expect( path.length ).to.equal( 4 );
		expect( path[0] ).to.be.point( start );
		expect( path[1] ).to.be.point( {x:100, y:25} );
		expect( path[2] ).to.be.point( {x:110, y:25} );
		expect( path[3] ).to.be.point( goal );
	});
	
	it.only('should connect two points by following only the grid when no polygons are available.', function() {
		var start = {x:120, y:20};
		var goal = {x:120, y:50};
		var path = grid.bridgePoints(start, goal);
		
		expect( path.length ).to.equal( 5 );
		expect( path[0] ).to.be.point( start );
		expect( path[1] ).to.be.point( {x:120, y:25} );
		expect( path[2] ).to.be.point( {x:125, y:25} );
		// expect( path[3] ).to.be.point( some other point along the segment... );
		expect( path[4] ).to.be.point( goal );
	});
	
	it.only('should connect two points by following the grid using polygons, when available.', function() {
		var start = {x:20, y:70};
		var goal = {x:100, y:20};
		var path = grid.bridgePoints(start, goal);
		
		expect( path.length ).to.equal( 5 );
		expect( path[0] ).to.be.point( start );
		expect( path[1] ).to.be.point( {x:25, y:70} );
		expect( path[2] ).to.be.point( {x:75, y:25} );
		expect( path[3] ).to.be.point( {x:100, y:25} );
		expect( path[4] ).to.be.point( goal );
	});
	
	it('should exclude start point when already at a valid grid location.', function() {
		var start = {x:25, y:50};
		var goal = {x:26, y:26};
		var path = grid.bridgePoints(start, goal);

		expect( path.length ).to.equal( 2 );
		expect( path[0] ).to.be.point( {x:25, y:50} );
		expect( path[1] ).to.be.point( {x:26, y:26} );
	});
	
	it('should exclude out-of-grid goal node when confined to the grid.', function() {
		var start = {x:100, y:20};
		var goal = {x:110, y:20};
		var path = grid.bridgePoints(start, goal, true);
		
		expect( path.length ).to.equal( 3 );
		expect( path[0] ).to.be.point( start );
		expect( path[1] ).to.be.point( {x:100, y:25} );
		expect( path[2] ).to.be.point( {x:110, y:25} );
	});
	
	it.skip("bridgePoints: should connect two points via the grid using snapped-point bridge.", function() {
		var a = grid.addNode(0, 0).id;
		var b = grid.addNode(100, 100).id;
		var c = grid.addNode(200, 100).id;
		var d = grid.addNode(300, 0).id;
		grid.joinNodes(a, b);
		grid.joinNodes(b, c);
		grid.joinNodes(c, d);
		
		var path = grid.bridgePoints({x:50, y:40}, {x:240, y:40});

		// Test that we got a path back:
		expect( path.length ).to.equal( 6 );
		
		// Test that the grid has been cleaned up:
		expect( grid.getNumNodes() ).to.equal( 4 );
	});
	
	it("bridgePoints: should eliminate redundant points in returned path.");
});