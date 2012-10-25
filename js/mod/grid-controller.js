/**
* Grid Controller.
* Defines application business logic and consolidates behavior into a single API.
*/
define([
	'lib/backbone',
	'lib/constellation',
	'mod/grid-model',
	'mod/grid-selection-model'
],
function( Backbone, constellation, gridModel, selectModel ) {
	
	var GridController = Backbone.Model.extend({
		ALERT: 'alert',
		searchGrid: new constellation.Grid(),
		
		// Tests if the environment is configured for performing node operations.
		nodeOpsEnabled: function() {
			return selectModel.type === gridModel.NODE;
		},
		
		// Resets all data stored within the Constellation seach grid.
		resetSearchGrid: function() {
			this.searchGrid.setData( gridModel.getNodes(), gridModel.getPolys() );
		},
		
		// Joins all nodes within the current selection group.
		joinNodes: function() {
			if ( this.nodeOpsEnabled() ) {
				gridModel.joinNodes( selectModel.items );
			} else {
				this.alert("Please select two or more nodes.");
			}
		},
		
		// Splits all nodes within the current selection group.
		splitNodes: function() {
			if ( this.nodeOpsEnabled() ) {
				gridModel.splitNodes( selectModel.items );
			} else {
				this.alert("Please select two or more nodes.");
			}
		},
		
		// Makes a polygon using the nodes in the current selection group.
		makePolygon: function() {
			if ( this.nodeOpsEnabled() ) {
				gridModel.addPolygon( selectModel.items );
			} else {
				this.alert("Please select two or more nodes.");
			}
		},
		
		// Removes all selected geometry (may be nodes or polygons).
		deleteGeometry: function() {
			if ( this.nodeOpsEnabled() ) {
				// NODES
				gridModel.removeNodes( selectModel.items );
			} else {
				// POLYGONS
				gridModel.removePolygons( selectModel.items );
			}
			selectModel.deselectAll();
		},
		
		// Finds the shortest grid path between two selected points.
		runPathfinder: function() {
			if ( this.nodeOpsEnabled() && selectModel.items.length === 2 ) {
				this.resetSearchGrid();
				this.searchGrid.findPath( selectModel.items[0], selectModel.items[1] );
			} else {
				this.alert("Please select exactly two nodes.");
			}
		},
		
		// Snaps a node onto the nearest grid line.
		snapNodeToGrid: function() {
			if ( this.nodeOpsEnabled() && selectModel.items.length === 1 ) {
				this.resetSearchGrid();
				var node = gridModel.getNodeById( selectModel.items[0] ),
					to = this.searchGrid.snapPointToGrid( node );
				
				node.x = to.x;
				node.y = to.y;
				gridModel.update();

			} else {
				this.alert("Please select exactly one node.");
			}
		},
		
		alert: function(mssg) {
			this.trigger( this.ALERT, mssg );
		}
	});
	
	return new GridController();
});