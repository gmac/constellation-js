define([
	'lib/underscore',
	'mod/grid-model'
],
function( _, gridModel ) {
	/**
	* Jasmine test suite for MMD framework.
	*/
	describe("Constellation Grid Model", function() {

		it("should add and access Node models using addNode / getNodeById.", function() {
			var x = 55,
				y = 71,
				id = gridModel.addNode(x, y),
				node = gridModel.getNodeById( id );
				
			//
			expect( _.size(gridModel.get('nodes')) ).toBe(1);
			expect( node.x ).toBe( x );
			expect( node.y ).toBe( y );
		});
		
		it("should connect two nodes using joinNodes.", function() {
			var link = [gridModel.addNode(0, 0), gridModel.addNode(100, 100)],
				invalid = 'sfoo';
				
			gridModel.joinNodes( link );
			
			expect( gridModel.getNodeById( link[0] ).to[ link[1] ] ).toBeTruthy();
			expect( gridModel.getNodeById( link[1] ).to[ link[0] ] ).toBeTruthy();
			
			link.push(invalid);
			gridModel.joinNodes( link );

			expect( gridModel.getNodeById( link[0] ).to[ invalid ] ).toBeFalsy();
		});
		
		it("should breaks two nodes using splitNodes.", function() {
			
		});
		
		it("should add a polygon as an array of 3+ node ids.", function() {
			
		});
	});
	
	jasmine.getEnv().execute();
});