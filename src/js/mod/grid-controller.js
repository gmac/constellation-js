/**
* Grid Controller.
* Defines application business logic and consolidates behavior into a single API.
*/
define([
	'lib/underscore',
	'lib/backbone',
	'lib/constellation',
	'mod/grid-model',
	'mod/grid-selection-model'
],
function( _, Backbone, constellation, gridModel, selectModel ) {
	
	var GridController = Backbone.Model.extend({
		ALERT: 'alert',
		
		// Tests if the environment is configured for performing node operations.
		nodeOpsEnabled: function() {
			return selectModel.type === gridModel.types.NODE;
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
			if ( this.nodeOpsEnabled() && selectModel.selectionSize() === 2 ) {
				var result = gridModel.findPath( selectModel.items[0], selectModel.items[1] );
				
				if ( result.valid ) {
					selectModel.selectPath( _.pluck(result.nodes, 'id') );
				}
			} else {
				this.alert("Please select exactly two nodes.");
			}
		},
		
		// Snaps a node onto the nearest grid line.
		snapNodeToGrid: function() {
			if ( this.nodeOpsEnabled() && selectModel.selectionSize() === 1 ) {
				var node = gridModel.getNodeById( selectModel.items[0] ),
					to = gridModel.snapPointToGrid( node );
				
				node.x = to.x;
				node.y = to.y;
				gridModel.update();

			} else {
				this.alert("Please select exactly one node.");
			}
		},
		
		// Finds and selects the nearest point to the current selection.
		selectNearestGridNode: function() {
			if ( this.nodeOpsEnabled() && selectModel.selectionSize() === 1 ) {
				var nearest = gridModel.getNearestNodeToNode( selectModel.items[0] );
				selectModel.select( nearest.id );
			} else {
				this.alert("Please select exactly one node.");
			}
		},
		
		// Hit tests a node among all polygon definitions.
		hitTestNodeInPolygons: function() {
			if ( selectModel.selectionSize() === 1 ) {
				var select;
				// Get new selection.
				if ( this.nodeOpsEnabled() ) {
					var node = gridModel.getNodeById( selectModel.items[0] );
					select = gridModel.getPolygonHitsForPoint( node );
				} else {
					select = gridModel.getNodesInPolygon( selectModel.items[0] );
				}
				
				if (select && select.length) {
					selectModel.setSelection( select );
				}
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