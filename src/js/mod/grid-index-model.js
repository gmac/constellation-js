/**
* Grid Index registry.
* Kind of a kludgy method for tracking a list of grid instances without a real server.
*/
define([
	'lib/backbone',
	'mod/grid-model'
],
function( Backbone, gridModel ) {
	
	var GridsIndex = Backbone.Collection.extend({
		
		localStorage: new Backbone.LocalStorage("constellation.index"),
		
		initialize: function() {
			gridModel.on( 'new', this.newRecord, this );
		},
		
		// Resets the collection with a list of models.
		reset: function() {
			// Perform default Backbone reset behavior.
			Backbone.Collection.prototype.reset.apply(this, arguments);
			
			// Reset the grid model record counter.
			gridModel.defaults.id = 0;
			
			// Set the grid model record counter outside the bounds of existing models.
			this.each(function( model ) {
				gridModel.defaults.id = Math.max( gridModel.defaults.id, model.id+1 );
			}, this);
		},
		
		// Creates a new record matching a newly-created grid instance.
		newRecord: function() {
			this.create({
				id: gridModel.get('id'),
				name: gridModel.get('name')
			});
		}
	});
	
	return new GridsIndex();
});