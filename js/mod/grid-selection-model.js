/**
* Selection Model.
* Manages the selection state of grid geometry.
*/
define([
	'lib/underscore',
	'lib/backbone'
],
function( _, Backbone ) {
	
	var SelectionModel = Backbone.Model.extend({
		UPDATE: 'update',
		
		// Stores a list of selected node ids.
		items: [],
		type: '',
		
		// Sets current selection group type (node or polygon)
		// Group type is defined by the first character of an id.
		setType: function( id, silent ) {
			id = id.substr(0, 1).toLowerCase();
			if ( this.type.length && this.type !== id ) {
				this.deselectAll( silent );
			}
			this.type = id;
		},
		
		// Toggles the selection status of a node.
		toggle: function( id ) {
			this.setType( id, true );
			if ( !this.select( id ) ) {
				this.deselect( id );
				return false;
			}
			return true;
		},
		
		// Selects a node by ID reference.
		select: function( id ) {
			this.setType( id, true );
			if ( !_.contains(this.items, id) ) {
				this.items.push( id );
				this.update();
				return true;
			}
			return false;
		},
		
		// Deletes a node by ID reference.
		deselect: function( id ) {
			if ( _.contains(this.items, id) ) {
				this.items.splice( _.indexOf(this.items, id), 1 );
				this.update();
				return true;
			}
			return false;
		},
		
		// Deselects all currently selected nodes.
		deselectAll: function( silent ) {
			this.items.length = 0;
			this.type = '';
			if (!silent) {
				this.update();
			}
		},
		
		// Triggers an update event to refresh the view.
		update: function() {
			this.trigger( this.UPDATE );
		}
	});
	
	return new SelectionModel();
});