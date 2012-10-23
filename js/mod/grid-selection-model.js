/**
* Manages the selection state of grid geometry.
* Stores key tables of all selected elements.
*/
define([
	'lib/underscore',
	'lib/backbone'
],
function( _, Backbone ) {
	
	var SelectionModel = Backbone.Model.extend({
		UPDATE: 'update',
		
		// Stores a list of selected node ids.
		nodes: [],
		
		// Toggles the selection status of a node.
		toggleNode: function( id, shift ) {
			var selected = _.contains(this.nodes, id);
			
			if ( selected && shift ) {
				this.deselectNode( id );
				return false;
			} else if (!shift) {
				this.deselectAllNodes(true);
			}
			this.selectNode( id );
			return true;
		},
		
		// Selects a node by ID reference.
		selectNode: function( id ) {
			if ( !_.contains(this.nodes, id) ) {
				this.nodes.push( id );
				this.update();
			}
		},
		
		// Deletes a node by ID reference.
		deselectNode: function( id ) {
			if ( _.contains(this.nodes, id) ) {
				this.nodes.splice(_.indexOf(id), 1);
				this.update();
			}
		},
		
		// Deselects all currently selected nodes.
		deselectAllNodes: function() {
			this.nodes.length = 0;
		},

		// Selects a polygon by ID reference.
		selectPolygon: function( id ) {
			this.deselectAllNodes(true);
		},
		
		update: function() {
			this.trigger( this.UPDATE );
		}
	});
	
	return new SelectionModel();
});