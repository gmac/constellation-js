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
		// Stores a list of selected node/poly ids.
		items: [],
		path: [],
		type: '',
		
		// Specifies the number of selected items.
		selectionSize: function() {
			return this.items.length;
		},
		
		// Selects a group of common geometry types by id reference.
		setSelection: function( group ) {
			this.setType( group[0] );
			this.items = group.slice();
			this.update();
		},
		
		// Sets current selection group type (node or polygon)
		// Group type is defined by the first character of an id.
		setType: function( id ) {
			id = id || '';
			
			if (id.length) {
				id = id.substr(0, 1).toLowerCase();
			}
			
			if ( this.type.length && this.type !== id ) {
				this.deselectAll();
			}
			this.type = id;
		},
		
		// Toggles the selection status of a node.
		toggle: function( id ) {
			this.setType( id );
			if ( !this.select( id ) ) {
				this.deselect( id );
				return false;
			}
			return true;
		},
		
		// Tests if the selection group contains an ID.
		contains: function( id ) {
			return _.contains(this.items, id);
		},
		
		// Selects a node by ID reference.
		select: function( id ) {
			this.setType( id );
			if ( !this.contains(id) ) {
				this.items.push( id );
				this.path.length = 0;
				this.update();
				return true;
			}
			return false;
		},
		
		// Deletes a node by ID reference.
		deselect: function( id ) {
			if ( this.contains(id) ) {
				this.items.splice( _.indexOf(this.items, id), 1 );
				this.path.length = 0;
				this.update();
				return true;
			}
			return false;
		},
		
		// Deselects all currently selected nodes.
		deselectAll: function( silent ) {
			this.items.length = 0;
			this.path.length = 0;
			this.type = '';
			if (!silent) {
				this.update();
			}
		},
		
		// Selects path of node ids.
		selectPath: function( ids, silent ) {
			this.path = ids.slice();
			if (!silent) {
				this.update();
			}
		},
		
		// Triggers an update event to refresh the view.
		update: function() {
			this.trigger('update');
		}
	});
	
	return new SelectionModel();
});