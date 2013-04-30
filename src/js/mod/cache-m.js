// Cache Model for managing data.

define([
	'lib/backbone'
],
function( Backbone ) {
	
	// Grid Data
	// ---------
	// Stores data for an individual grid layout.
	var GridDataModel = Backbone.Model.extend({
		defaults: {
			name: 'New Grid',
			nodes: null,
			polys: null
		},
		
		initialize: function() {
			this.nodes = this.nodes || {};
			this.polys = this.polys || {};
		}
	});
	
	// Cache
	// -----
	// Manages the collection of grid layout options.
	var CacheModel = Backbone.Collection.extend({
		
		model: GridDataModel,
		localStorage: new Backbone.LocalStorage("constellation"),
		
		_selectedIndex: -1,
		
		// Get / Set selected model index:
		selectedIndex: function(index) {
			if ( index !== 'undefined' && this._selectedIndex !== index ) {
				this._selectedIndex = Math.max(0, Math.min(index, this.models.length-1));
				this.trigger('select');
			}
			return this._selectedIndex;
		},
		
		// Get selected grid data model:
		selectedModel: function() {
			return this.at( this._selectedIndex );
		},
		
		// Creates a new record:
		newRecord: function(name, clone) {
			var params = {};
			
			if (name) {
				params.name = name;
			}
			
			if (clone) {
				params.nodes = this.selectedModel().get('nodes');
				params.polys = this.selectedModel().get('polys');
			}
			
			this.create(params);
			this.selectedIndex( this.models.length-1 );
		}
	});
	
	return new CacheModel();
});