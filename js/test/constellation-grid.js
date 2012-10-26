define([
	'lib/constellation',
	'lib/underscore'
],
function( Const, _ ) {
	
	describe("Constellation Grid", function() {
		
		// Environment config...
		var gridModel = new Const.Grid(),
			numUpdateEvents = 0,
			n0 = 'n0',
			n1 = 'n1',
			n2 = 'n2';
			
		function numConnections( id ) {
			return _.size( gridModel.getNodeById( id ).to );
		}

		function getConnection( a, b ) {
			return gridModel.getNodeById( a ).to[ b ];
		}
		
		gridModel.on( gridModel.events.CHANGE, function() {
			numUpdateEvents++;
		});
		
		
		// Setup
		beforeEach(function() {
			gridModel.reset();
			numUpdateEvents = 0;
		});
		
		// Teardown
		afterEach(function() {
			// do nothing.
		});
		
		it("addNode: should add a new node with specified X and Y coordinates, and return its id.", function() {
			var x = 55,
				y = 71,
				id = gridModel.addNode(x, y);
			
			// Check that an ID was returned.
			expect( id ).toBeTruthy();
			
			// Check that a node was added.
			expect( gridModel.getNumNodes() ).toBe(1);
			
			// Check that its coordinates are set.
			expect( gridModel.getNodeById(id).x ).toBe(x);
			expect( gridModel.getNodeById(id).y ).toBe(y);
			expect( numUpdateEvents ).toBe( 1 );
		});
		
		it("addNode: should add a new node without specified coordinates, which defaults to point [0,0].", function() {
			var id = gridModel.addNode();
			
			// One node should have been added.
			expect( gridModel.getNumNodes() ).toBe(1);
			
			// Its X and Y coordinates should default to zero.
			expect( gridModel.getNodeById(id).x ).toBe(0);
			expect( gridModel.getNodeById(id).y ).toBe(0);
			expect( numUpdateEvents ).toBe( 1 );
		});
		
		it("getNodeById: should get a single node by id reference.", function() {
			var a = gridModel.addNode();
			expect( gridModel.getNodeById( a ) ).toBe( gridModel.nodes[a] );
		});
		
		it("getNodesForIds: should get an array of nodes for an array of id references.", function() {
			var a = gridModel.addNode(),
				b = gridModel.addNode(),
				nodes = gridModel.getNodesForIds( [a, b] );
				
			expect( nodes[0] ).toBe( gridModel.getNodeById(a) );
			expect( nodes[1] ).toBe( gridModel.getNodeById(b) );
		});
		
		it("hasNodes: should validate that a group of node ids are defined.", function() {
			var a = gridModel.addNode(),
				b = gridModel.addNode();
				
			expect( gridModel.hasNodes( [a, b] ) ).toBeTruthy();
		});
		
		it("joinNodes: should join two valid nodes, referenced by id.", function() {
			var a = gridModel.addNode(0, 0),
			 	b = gridModel.addNode(100, 100);
			
			gridModel.joinNodes( [a, b] );
			
			// Each node should have one connection.
			expect( numConnections(a) ).toBe(1);
			expect( numConnections(b) ).toBe(1);
			
			// Each node should have a reference to one another.
			expect( getConnection(a, b) ).toBeTruthy();
			expect( getConnection(b, a) ).toBeTruthy();
			expect( numUpdateEvents ).toBe( 3 );
		});
		
		it("joinNodes: should defer action when joining less than two nodes.", function() {
			var id = gridModel.addNode(10, 10);
			
			gridModel.joinNodes( [id] ); // << takes no action.
			
			// Expect no connections to have been made.
			expect( numConnections(id) ).toBe(0);
			expect( numUpdateEvents ).toBe( 1 );
		});
		
		it("joinNodes: should defer action when joining a group with invalid node references.", function() {
			var valid = gridModel.addNode(10, 10);
			
			gridModel.joinNodes( [ valid, 'invalid' ] ); // << takes no action.
			
			expect( numConnections(valid) ).toBe(0);
			expect( numUpdateEvents ).toBe( 1 );
		});
		
		it("splitNodes: should split multiple connected nodes.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(100, 100, true), 
				c = gridModel.addNode(100, 200, true);
				
			gridModel.joinNodes( [a, b, c] );
			
			// Each node should have two connections.
			_.each(gridModel.nodes, function( node ) {
				expect( _.size(node.to) ).toBe(2);
			});
			
			// Exclude last node, then split the other two.
			gridModel.splitNodes( [a, b] );
			
			// First two nodes should now have one connection, third node should still have two.
			expect( numConnections(a) ).toBe(1);
			expect( numConnections(b) ).toBe(1);
			expect( numConnections(c) ).toBe(2);
			
			// Remaining connection on the first two nodes should be to the third.
			expect( getConnection(a, c) ).toBeTruthy();
			expect( getConnection(a, c) ).toBeTruthy();
			expect( numUpdateEvents ).toBe( 2 );
		});
		
		it("splitNodes: should defer action when splitting unconnected nodes.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(100, 100, true), 
				c = gridModel.addNode(100, 200, true);
			
			// Join two nodes.
			gridModel.joinNodes([a, b]);
				
			function testNumConnections() {
				expect( numConnections(a) ).toBe(1);
				expect( numConnections(b) ).toBe(1);
				expect( numConnections(c) ).toBe(0);
			}
				
			testNumConnections();
			
			gridModel.splitNodes( [a, c] ); // << takes no action.
			
			testNumConnections();
			expect( numUpdateEvents ).toBe( 1 );
		});
		
		it("splitNodes: should completely detach a single node from all connections while splitting.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(100, 100, true), 
				c = gridModel.addNode(100, 200, true);
				
			gridModel.joinNodes([a, b, c]);
			
			// Each node should have two connections.
			_.each(gridModel.nodes, function( node ) {
				expect( _.size(node.to) ).toBe(2);
			});
			
			gridModel.splitNodes( [a] );
			
			expect( numConnections(a) ).toBe(0);
			expect( numConnections(b) ).toBe(1);
			expect( numConnections(c) ).toBe(1);
			expect( numUpdateEvents ).toBe( 2 );
		});
		
		it("detachNodes: should completely detach a group of nodes from all connections.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(100, 100, true), 
				c = gridModel.addNode(100, 200, true),
				d = gridModel.addNode(100, 200, true);
				
			gridModel.joinNodes( [a, b, c, d] );
			
			// Each node should have two connections.
			_.each(gridModel.nodes, function( node ) {
				expect( _.size(node.to) ).toBe(3);
			});
			
			gridModel.detachNodes( [a, b] );
			
			expect( numConnections(a) ).toBe(0);
			expect( numConnections(b) ).toBe(0);
			expect( numConnections(c) ).toBe(1);
			expect( numConnections(d) ).toBe(1);
			expect( numUpdateEvents ).toBe( 2 );
		});
		
		it("removeNodes: should remove a valid node, and detach its connections.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(100, 100, true), 
				c = gridModel.addNode(100, 200, true),
				d = gridModel.addNode(200, 200, true);
			
			// Expect four nodes in the model.
			expect( gridModel.getNumNodes() ).toBe(4);
			
			// Join all nodes, then confirm they each have three connections.
			gridModel.joinNodes( [a, b, c, d] );
			
			_.each(gridModel.nodes, function( node ) {
				expect( _.size(node.to) ).toBe(3);
			});
			
			// Remove nodes A and B.
			gridModel.removeNodes( [a, b] );
			
			// Confirm that there are now two nodes, each now with only one connection.
			expect( gridModel.getNumNodes() ).toBe(2);
			expect( numConnections(c) ).toBe(1);
			expect( numConnections(d) ).toBe(1);
			
			// Confirm that C and D are still connected to one another.
			expect( getConnection(c, d) ).toBeTruthy();
			expect( getConnection(d, c) ).toBeTruthy();
			expect( numUpdateEvents ).toBe( 2 );
		});
		
		it("removeNodes: should defer action when removing an invalid node reference.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(100, 100, true);
			
			// Expect two nodes in the model.
			expect( gridModel.getNumNodes() ).toBe(2);
			
			// Remove node A, and a second invalid reference.
			gridModel.removeNodes( [a, 'invalid'] );
			
			// Expect A to have been removed, and the invalid reference to have been ignored.
			expect( gridModel.getNumNodes() ).toBe(1);
			expect( numUpdateEvents ).toBe( 1 );
		});
		
		it("removeNodes: should remove all dependent polygons while removing a node.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(100, 100, true), 
				c = gridModel.addNode(100, 200, true),
				p = gridModel.addPolygon( [a, b, c] );
				
			expect( gridModel.getNumPolygons() ).toBe(1);
			gridModel.removeNodes( [a, b] );
			expect( gridModel.getNumPolygons() ).toBe(0);
			expect( numUpdateEvents ).toBe( 2 );
		});
		
		it("addPolygon: should create a polygon from a group of nodes, and return its id.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(100, 100, true), 
				c = gridModel.addNode(100, 200, true),
				p = gridModel.addPolygon( [a, b, c], true );

			expect( p ).toBeTruthy();
			expect( gridModel.getNumPolygons() ).toBe(1);
			expect( gridModel.getPolygonById(p).nodes.length ).toBe(3);
			expect( numUpdateEvents ).toBe( 0 );
		});
		
		it("addPolygon: should defer action when creating a polygon with less than three nodes.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(100, 100, true),
				p = gridModel.addPolygon( [a, b] ); // << takes no action.

			expect( p ).toBeFalsy();
			expect( gridModel.getNumPolygons() ).toBe(0);
			expect( numUpdateEvents ).toBe( 0 );
		});
		
		it("addPolygon: should defer action when creating a polygon with an invalid node reference.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(100, 100, true),
				p = gridModel.addPolygon( [a, b, 'sfoo'] ); // << takes no action.

			expect( p ).toBeFalsy();
			expect( gridModel.getNumPolygons() ).toBe(0);
			expect( numUpdateEvents ).toBe( 0 );
		});
		
		it("getPolygonById: should get a single polygon by id reference.", function() {
			var a = gridModel.addNode(),
				b = gridModel.addNode(),
				c = gridModel.addNode(),
				p = gridModel.addPolygon( [a, b, c] );
			expect( gridModel.getPolygonById(p) ).toBe( gridModel.polys[p] );
		});
		
		it("getNodesForPolygon: should get an array of nodes for a polygon reference.", function() {
			var a = gridModel.addNode(),
				b = gridModel.addNode(),
				c = gridModel.addNode(),
				p = gridModel.addPolygon( [a, b, c] ),
				nodes = gridModel.getNodesForPolygon(p);
				
			expect( nodes[0] ).toBe( gridModel.getNodeById(a) );
			expect( nodes[1] ).toBe( gridModel.getNodeById(b) );
			expect( nodes[2] ).toBe( gridModel.getNodeById(c) );
		});
		
		it("removePolygons: should remove multiple valid polygons.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(100, 100, true), 
				c = gridModel.addNode(100, 200, true),
				p1 = gridModel.addPolygon([a, b, c], true),
				p2 = gridModel.addPolygon([a, b, c], true);
				
			expect( gridModel.getNumPolygons() ).toBe(2);
			
			gridModel.removePolygons( [p1, p2] );
			
			expect( gridModel.getNumPolygons() ).toBe(0);
			expect( numUpdateEvents ).toBe( 1 );
		});
		
		it("removePolygons: should defer action when removing an invalid polygon reference.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(100, 100, true), 
				c = gridModel.addNode(100, 200, true),
				p1 = gridModel.addPolygon([a, b, c], true),
				p2 = gridModel.addPolygon([a, b, c], true);
				
			expect( gridModel.getNumPolygons() ).toBe(2);
			
			gridModel.removePolygons( [p1, 'invalid'] );
			
			expect( gridModel.getNumPolygons() ).toBe(1);
			expect( numUpdateEvents ).toBe( 1 );
		});
		
		it("findPath: should find a path between two joined nodes.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(0, 100, true);
				
			gridModel.joinNodes( [a, b] );
			
			var result = gridModel.findPath( a, b );
			
			expect( result.valid ).toBeTruthy();
			expect( result.nodes[0] ).toBe( gridModel.getNodeById(a) );
			expect( result.nodes[1] ).toBe( gridModel.getNodeById(b) );
		});
		
		it("findPath: should find a path between two nodes across a network of joined nodes.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(0, 100, true),
				c = gridModel.addNode(0, 200, true);
				
			gridModel.joinNodes( [a, b] );
			gridModel.joinNodes( [b, c] );
			
			var result = gridModel.findPath( a, c );
			
			expect( result.valid ).toBeTruthy();
			expect( result.nodes[0] ).toBe( gridModel.getNodeById(a) );
			expect( result.nodes[1] ).toBe( gridModel.getNodeById(b) );
			expect( result.nodes[2] ).toBe( gridModel.getNodeById(c) );
		});
		
		it("findPath: should fail to find a path between two nodes in unconnected grid fragments.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(0, 100, true),
				c = gridModel.addNode(0, 200, true);
				
			gridModel.joinNodes( [a, b] );
			
			var result = gridModel.findPath( a, c );
			
			expect( result.valid ).toBeFalsy();
			expect( result.nodes.length ).toBe( 0 );
		});
		
		it("findPath: should find the shortest path between two nodes, regardless of connection count.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(25, 0, true),
				c = gridModel.addNode(75, 0, true),
				d = gridModel.addNode(100, 0, true),
				e = gridModel.addNode(50, 100, true);
				
			gridModel.joinNodes( [a, b] );
			gridModel.joinNodes( [b, c] );
			gridModel.joinNodes( [c, d] );
			gridModel.joinNodes( [a, e] );
			gridModel.joinNodes( [c, d] );
			
			var result = gridModel.findPath( a, d );
			
			expect( result.valid ).toBeTruthy();
			expect( result.length ).toBe( 100 );
			expect( result.nodes.length ).toBe( 4 );
		});
		
		it("snapPointToGrid: should return a point snapped to the nearest grid line segment.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(100, 0, true);
				
			gridModel.joinNodes( [a, b] );

			var snapped = gridModel.snapPointToGrid( {x:50, y:20} );
			
			expect( snapped.x ).toBe( 50 );
			expect( snapped.y ).toBe( 0 );
		});
		
		it("snapPointToGrid: should defer action when snapping a point to a grid with no nodes.", function() {
			var a = {x:50, y:20},
				b = gridModel.snapPointToGrid( a );
			
			expect( b.x ).toBe( a.x );
			expect( b.y ).toBe( a.y );
		});
		
		it("snapPointToGrid: should defer action when snapping a point to a grid with no node connections.", function() {
			gridModel.addNode();
			gridModel.addNode();
			
			var a = {x:50, y:20},
				b = gridModel.snapPointToGrid( a );
			
			expect( b.x ).toBe( a.x );
			expect( b.y ).toBe( a.y );
		});
		
		it("getNearestNodeToNode: should find the nearest node to the specified origin node.", function() {
			var a = gridModel.addNode(0, 0),
				b = gridModel.addNode(100, 100),
				c = gridModel.addNode(10, 10),
				n = gridModel.getNearestNodeToNode( c );
			
			expect( n ).toBe( gridModel.getNodeById(a) );
		});
		
		it("getNearestNodeToNode: should return null when an invalid origin node is referenced.", function() {
			var a = gridModel.addNode(0, 0),
				b = gridModel.addNode(100, 100),
				n = gridModel.getNearestNodeToNode( 'invalid' );
			
			expect( n ).toBe( null );
		});
		
		it("getNearestNodeToNode: should return null when there are no other nodes besides the origin.", function() {
			var a = gridModel.addNode(0, 0),
				n = gridModel.getNearestNodeToNode( a );
			
			expect( n ).toBe( null );
		});
		
		it("getNearestNodeToPoint: should find the nearest node to the provided point.", function() {
			var a = gridModel.addNode(0, 0),
				b = gridModel.addNode(100, 0),
				n = gridModel.getNearestNodeToPoint( {x:10, y:0} );
			
			expect( n ).toBe( gridModel.getNodeById(a) );
		});
		
		it("hitTestPointInPolygons: should return true if the specified point falls within any polygon, otherwise false.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(100, 0, true), 
				c = gridModel.addNode(0, 100, true),
				d = gridModel.addNode(100, 100, true),
				p1 = gridModel.addPolygon( [a, b, c], true ),
				p2 = gridModel.addPolygon( [b, c, d], true );
			
			expect( gridModel.hitTestPointInPolygons({x:10, y:10}) ).toBe( true );
			expect( gridModel.hitTestPointInPolygons({x:90, y:90}) ).toBe( true );
			expect( gridModel.hitTestPointInPolygons({x:200, y:200}) ).toBe( false );
		});
		
		it("hitTestPointInPolygons: should return false when there are no polygons in the grid.", function() {
			expect( gridModel.hitTestPointInPolygons({x:10, y:10}) ).toBe( false );
		});
		
		it("getPolygonHitsForPoint: should return an array of all polygon ids hit by a point.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(100, 0, true), 
				c = gridModel.addNode(0, 100, true),
				d = gridModel.addNode(100, 100, true),
				p1 = gridModel.addPolygon( [a, b, c], true ),
				p2 = gridModel.addPolygon( [a, c, d], true ),
				hit1 = gridModel.getPolygonHitsForPoint({x:5, y:50}),
				hit2 = gridModel.getPolygonHitsForPoint({x:50, y:5}),
				hit3 = gridModel.getPolygonHitsForPoint({x:95, y:50});
				
			expect( hit1.length ).toBe( 2 );
			expect( hit2.length ).toBe( 1 );
			expect( hit3.length ).toBe( 0 );
		});
	});
});