/**
* Grid Controller.
* Defines application business logic and consolidates behavior into a single API.
*/
define([
	'lib/underscore',
	'lib/backbone',
	'lib/constellation',
	'mod/grid-m',
	'mod/selection-m'
],
function( _, Backbone, constellation, gridModel, selectionModel ) {
	
	var GridController = Backbone.Model.extend({
		ALERT: 'alert',
		
		// Tests if the environment is configured for performing node operations.
		nodeOpsEnabled: function() {
			return selectionModel.type === gridModel.types.NODE;
		},
		
		// Resets selection and then creates a new grid.
		newGrid: function() {
			selectionModel.deselectAll( true );
			gridModel.newGrid();
		},
		
		// Resets selection and then loads a grid.
		loadGrid: function( id ) {
			selectionModel.deselectAll( true );
			gridModel.loadGrid( parseInt(id, 10) );
		},
		
		// Saves the existing grid model.
		saveGrid: function() {
			gridModel.saveGrid();
		},
		
		// Joins all nodes within the current selection group.
		joinNodes: function() {
			if ( this.nodeOpsEnabled() ) {
				gridModel.joinNodes( selectionModel.items );
			} else {
				this.alert("Please select two or more nodes.");
			}
		},
		
		// Splits all nodes within the current selection group.
		splitNodes: function() {
			if ( this.nodeOpsEnabled() ) {
				gridModel.splitNodes( selectionModel.items );
			} else {
				this.alert("Please select two or more nodes.");
			}
		},
		
		// Makes a polygon using the nodes in the current selection group.
		makePolygon: function() {
			if ( this.nodeOpsEnabled() ) {
				gridModel.addPolygon( selectionModel.items );
			} else {
				this.alert("Please select two or more nodes.");
			}
		},
		
		// Removes all selected geometry (may be nodes or polygons).
		deleteGeometry: function() {
			if ( this.nodeOpsEnabled() ) {
				// NODES
				gridModel.removeNodes( selectionModel.items );
			} else {
				// POLYGONS
				gridModel.removePolygons( selectionModel.items );
			}
			selectionModel.deselectAll();
		},
		
		// Finds the shortest grid path between two selected points.
		runPathfinder: function() {
			if ( this.nodeOpsEnabled() && selectionModel.selectionSize() === 2 ) {
				var result = gridModel.findPath( selectionModel.items[0], selectionModel.items[1] );
				
				if ( result.valid ) {
					selectionModel.selectPath( _.pluck(result.nodes, 'id') );
				}
			} else {
				this.alert("Please select exactly two nodes.");
			}
		},
		
		// Snaps a node onto the nearest grid line.
		snapNodeToGrid: function() {
			if ( this.nodeOpsEnabled() && selectionModel.selectionSize() === 1 ) {
				var node = gridModel.getNodeById( selectionModel.items[0] ),
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
			if ( this.nodeOpsEnabled() && selectionModel.selectionSize() === 1 ) {
				var nearest = gridModel.getNearestNodeToNode( selectionModel.items[0] );
				selectionModel.select( nearest.id );
			} else {
				this.alert("Please select exactly one node.");
			}
		},
		
		// Hit tests a node among all polygon definitions.
		hitTestNodeInPolygons: function() {
			if ( selectionModel.selectionSize() === 1 ) {
				var select;
				// Get new selection.
				if ( this.nodeOpsEnabled() ) {
					var node = gridModel.getNodeById( selectionModel.items[0] );
					select = gridModel.getPolygonHitsForPoint( node );
				} else {
					select = gridModel.getNodesInPolygon( selectionModel.items[0] );
				}
				
				if (select && select.length) {
					selectionModel.setSelection( select );
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