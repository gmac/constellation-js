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
	
	// Create new grid, then remove default event system to avoid conflicts with Backbone.
	var model = new Const.Grid();
	delete model.on;
	delete model.off;
	
	var GridModel = Backbone.Model.extend( model ).extend({
		
		// Default model attributes.
		defaults: {
			icount: 0,
			nodes: null,
			polys: null,
			width: '',
			height: '',
			background: ''
		},

		// Initializes the grid model (native Backbone behavior).
		initialize: function() {
			
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