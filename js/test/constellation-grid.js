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
		
		it("should add a new node with specified X and Y coordinates, and return its id.", function() {
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
		
		it("should add a new node without specified coordinates, which defaults to point [0,0].", function() {
			var id = gridModel.addNode();
			
			// One node should have been added.
			expect( gridModel.getNumNodes() ).toBe(1);
			
			// Its X and Y coordinates should default to zero.
			expect( gridModel.getNodeById(id).x ).toBe(0);
			expect( gridModel.getNodeById(id).y ).toBe(0);
			expect( numUpdateEvents ).toBe( 1 );
		});
		
		it("should validate that a group of node ids are defined.", function() {
			var a = gridModel.addNode(),
				b = gridModel.addNode();
				
			expect( gridModel.hasNodes( [a, b] ) ).toBeTruthy();
		});
		
		it("should join two valid nodes, referenced by id.", function() {
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
		
		it("should defer action when joining less than two nodes.", function() {
			var id = gridModel.addNode(10, 10);
			
			gridModel.joinNodes( [id] ); // << takes no action.
			
			// Expect no connections to have been made.
			expect( numConnections(id) ).toBe(0);
			expect( numUpdateEvents ).toBe( 1 );
		});
		
		it("should defer action when joining a group with invalid node references.", function() {
			var valid = gridModel.addNode(10, 10);
			
			gridModel.joinNodes( [ valid, 'invalid' ] ); // << takes no action.
			
			expect( numConnections(valid) ).toBe(0);
			expect( numUpdateEvents ).toBe( 1 );
		});
		
		it("should split multiple connected nodes.", function() {
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
		
		it("should defer action when splitting unconnected nodes.", function() {
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
		
		it("should completely detach a single node from all connections while splitting.", function() {
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
		
		it("should completely detach a group of nodes from all connections.", function() {
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
		
		it("should remove a valid node, and detach its connections.", function() {
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
		
		it("should defer action when removing an invalid node reference.", function() {
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
		
		it("should remove all dependent polygons while removing a node.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(100, 100, true), 
				c = gridModel.addNode(100, 200, true),
				p = gridModel.addPolygon( [a, b, c] );
				
			expect( gridModel.getNumPolygons() ).toBe(1);
			gridModel.removeNodes( [a, b] );
			expect( gridModel.getNumPolygons() ).toBe(0);
			expect( numUpdateEvents ).toBe( 2 );
		});
		
		it("should create a polygon from a group of nodes, and return its id.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(100, 100, true), 
				c = gridModel.addNode(100, 200, true),
				p = gridModel.addPolygon( [a, b, c], true );

			expect( p ).toBeTruthy();
			expect( gridModel.getNumPolygons() ).toBe(1);
			expect( gridModel.getPolygonById(p).sides ).toBe(3);
			expect( numUpdateEvents ).toBe( 0 );
		});
		
		it("should defer action when creating a polygon with less than three nodes.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(100, 100, true),
				p = gridModel.addPolygon( [a, b] ); // << takes no action.

			expect( p ).toBeFalsy();
			expect( gridModel.getNumPolygons() ).toBe(0);
			expect( numUpdateEvents ).toBe( 0 );
		});
		
		it("should defer action when creating a polygon with an invalid node reference.", function() {
			var a = gridModel.addNode(0, 0, true),
				b = gridModel.addNode(100, 100, true),
				p = gridModel.addPolygon( [a, b, 'sfoo'] ); // << takes no action.

			expect( p ).toBeFalsy();
			expect( gridModel.getNumPolygons() ).toBe(0);
			expect( numUpdateEvents ).toBe( 0 );
		});
		
		it("should remove a valid polygon.", function() {
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
		
		it("should defer action when removing an invalid polygon reference.", function() {
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
	});
});