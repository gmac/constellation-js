/**
* Grid Controller.
* Defines application business logic and consolidates behavior into a single API.
*/
define([
	'lib/underscore',
	'lib/backbone',
	'lib/constellation',
	'./grid-m',
	'./selection-m'
],
function( _, Backbone, constellation, gridModel, selectionModel ) {
	
	var GridController = Backbone.Model.extend({
		// Tests if the environment is configured for performing node operations.
		nodeOpsEnabled: function() {
			return selectionModel.type === 'n';
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
		
		// Saves the existing grid model.
		newGrid: function() {
			gridModel.reset();
		},
		
		// Joins all nodes within the current selection group.
		joinNodes: function() {
			if ( this.nodeOpsEnabled() && selectionModel.selectionSize() > 1 ) {
				gridModel.joinNodes( selectionModel.items );
			} else {
				this.alert("Select two or more points.");
			}
		},
		
		// Splits all nodes within the current selection group.
		splitNodes: function() {
			if ( this.nodeOpsEnabled() && selectionModel.selectionSize() > 1 ) {
				gridModel.splitNodes( selectionModel.items );
			} else {
				this.alert("Select two or more joined points.");
			}
		},
		
		// Makes a polygon using the nodes in the current selection group.
		makePolygon: function() {
			if ( this.nodeOpsEnabled() && selectionModel.selectionSize() >= 3 ) {
				gridModel.addPolygon( selectionModel.items );
			} else {
				this.alert("Select three or more points.");
			}
		},
		
		// Removes all selected geometry (may be nodes or polygons).
		deleteGeometry: function() {
			if ( !selectionModel.selectionSize() ) {
				this.alert("No selected geometry.");
				return;
			}
			else if ( this.nodeOpsEnabled() ) {
				// NODES
				gridModel.removeNodes( selectionModel.items );
			} else {
				// POLYGONS
				gridModel.removePolygons( selectionModel.items );
			}
			selectionModel.deselectAll();
		},
		
		// Finds the shortest grid path between two selected points.
		findPath: function() {
			if ( this.nodeOpsEnabled() && selectionModel.selectionSize() === 2 ) {
				var result = gridModel.findPath( selectionModel.items[0], selectionModel.items[1] );
				
				if ( result.valid ) {
					selectionModel.selectPath( _.pluck(result.nodes, 'id') );
				}
			} else {
				this.alert("Select two points.");
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
				this.alert("Select a single point.");
			}
		},
		
		// Finds and selects the nearest point to the current selection.
		selectNearestGridNode: function() {
			if ( this.nodeOpsEnabled() && selectionModel.selectionSize() === 1 ) {
				var nearest = gridModel.getNearestNodeToNode( selectionModel.items[0] );
				selectionModel.select( nearest.id );
			} else {
				this.alert("Select a single point.");
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
				this.alert("Select a single point or polygon.");
			}
		},
		
		alert: function(mssg) {
			this.trigger( 'alert', mssg );
		}
	});
	
	return new GridController();
});