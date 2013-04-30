/**
* Grid Model.
* Main application model for managing node and polygon data.
*/
define([
	'lib/backbone',
	'lib/underscore',
	'lib/constellation'
],
function( Backbone, _, Const ) {
	
	var GridModel = Backbone.Model.extend( new Const.Grid() ).extend({
		
		localStorage: new Backbone.LocalStorage("constellation"),

		// Default model attributes.
		defaults: {
			id: 0,
			name: 'Untitled',
			icount: 0,
			nodes: null,
			polys: null,
			background: ''
		},

		// Initializes the grid model.
		initialize: function() {
			// Override Constellation event model with Backbone behaviors.
			this.on = Backbone.Events.on;
			this.off = Backbone.Events.off;
			this.emit = Backbone.Events.trigger;
		},
		
		// Override id factory method so that instance counter is saved with the model.
		_id: function( type ) {
			return type + this.attributes.icount++;
		},
		
		// Creates a new grid instance.
		newGrid: function() {
			this.defaults.id++;
			this.set( this.defaults, {silent:true} );
			this.nodes = {};
			this.polys = {};
			this.trigger('new');
			this.saveGrid();
			this.update();
		},
		
		// Loads new grid data into the model.
		loadGrid: function( id ) {
			this.set('id', id);
			this.fetch({
				success: function( model ) {
					model.nodes = model.get('nodes');
					model.polys = model.get('polys');
					model.update();
				}
			});
		},
		
		// Saves data currently stored within the model.
		saveGrid: function() {
			this.save({
				nodes: this.nodes,
				polys: this.polys
			});
		},
		
		// Loads new grid data into the model.
		deleteGrid: function() {
			this.destroy();
		}
	});
	
	return new GridModel();
});