/**
* Grid Selection Model test specs.
*/
define([
	'mod/grid-selection-m'
],
function( selectModel ) {
	
	describe("Grid Selection Model", function() {
		
		var n0 = "n0",
			n1 = "n1",
			p0 = "p0",
			p1 = "p1";
		
		// Setup
		beforeEach(function() {
			// do nothing.
		});
		
		// Teardown
		afterEach(function() {
			selectModel.deselectAll();
		});
		
		it("should add a geometry item to an empty selection group.", function() {
			expect( selectModel.select(n0) ).toBeTruthy();
			expect( selectModel.items.length ).toBe(1);
			expect( selectModel.items[0] ).toBe(n0);
		});
		
		it("should not allow unique ids to be added more than once.", function() {
			expect( selectModel.select(n0) ).toBeTruthy();
			expect( selectModel.select(n0) ).toBeFalsy();
			expect( selectModel.items.length ).toBe(1);
		});
		
		it("should manage a selection type (node/polygon) based on the first character of a passed id.", function() {
			selectModel.select(n0);
			expect( selectModel.type ).toBe( n0.substr(0, 1) );
			
			selectModel.select(p0);
			expect( selectModel.type ).toBe( p0.substr(0, 1) );
			
			selectModel.deselectAll();
			expect( selectModel.type ).toBe( '' );
		});
		
		it("should remove a geometry item from the current selection group.", function() {
			selectModel.select( n0 );
			selectModel.select( n1 );
			expect( selectModel.items.length ).toBe(2);
			
			expect( selectModel.deselect( n0 ) ).toBeTruthy();
			expect( selectModel.items.length ).toBe(1);
			expect( selectModel.items[0] ).toBe( n1 );
		});
		
		it("should toggle an unselected item into the selection group.", function() {
			selectModel.select( n0 );
			expect( selectModel.toggle(n1) ).toBeTruthy();
			expect( selectModel.items.length ).toBe(2);
			expect( selectModel.items[1] ).toBe( n1 );
		});
		
		it("should toggle a selected item out of the selection group.", function() {
			selectModel.select( n0 );
			selectModel.select( n1 );
			
			expect( selectModel.toggle(n0) ).toBeFalsy();
			expect( selectModel.items.length ).toBe(1);
			expect( selectModel.items[0] ).toBe( n1 );
		});
		
		it("should deselect all items within the current selection group.", function() {
			selectModel.select( n0 );
			selectModel.select( n1 );
			
			expect( selectModel.items.length ).toBe(2);
			selectModel.deselectAll();
			expect( selectModel.items.length ).toBe(0);
		});
		
		it("switching geometry type (defined by the first character of an id) should reset the selection before adding items.", function() {
			selectModel.select( n0 );
			expect( selectModel.items.length ).toBe(1);
			expect( selectModel.items[0] ).toBe( n0 );
			
			selectModel.select( p0 );
			expect( selectModel.items.length ).toBe(1);
			expect( selectModel.items[0] ).toBe( p0 );
		});
		
		it("switching geometry type (defined by the first character of an id) should reset the selection before toggling items.", function() {
			selectModel.toggle( n0 );
			expect( selectModel.items.length ).toBe(1);
			expect( selectModel.items[0] ).toBe( n0 );
			
			selectModel.toggle( p0 );
			expect( selectModel.items.length ).toBe(1);
			expect( selectModel.items[0] ).toBe( p0 );
		});
	});
	
});