/**
* Grid Model.
* Main application model for managing node and polygon data.
*/
define([
	'lib/backbone',
	'lib/underscore',
	'lib/constellation',
	'mod/service-data'
],
function( Backbone, _, Const, dataService ) {
	
	var GridModel = Backbone.Model.extend( new Const.Grid() ).extend({
		
		// Default model attributes.
		defaults: {
			icount: 0,
			nodes: null,
			polys: null,
			width: '',
			height: '',
			background: ''
		},

		// Initializes the grid model.
		initialize: function() {
			// Override Constellation event model with Backbone behaviors.
			this.on = Backbone.Events.on;
			this.off = Backbone.Events.off;
			this.emit = Backbone.Events.trigger;
		},

		// Loads new grid data into the model.
		getLayoutsList: function() {
			dataService.getLayoutsList();
		},
		
		// Loads new grid data into the model.
		loadLayout: function( name ) {
			dataService.loadLayout( name );
		},
		
		// Loads new grid data into the model.
		saveLayout: function( name ) {
			dataService.saveLayout( name, _data );
		},
		
		// Loads new grid data into the model.
		deleteLayout: function( name ) {
			dataService.deleteLayout( name );
		}
	});
	
	return new GridModel();
});