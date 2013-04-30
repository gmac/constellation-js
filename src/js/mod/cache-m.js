// Cache Model for managing data.

define([
	'lib/backbone'
],
function( Backbone ) {
	
	var GridDataModel = Backbone.Collection.extend({
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
	
	
	var CacheModel = Backbone.Collection.extend({
		
		localStorage: new Backbone.LocalStorage("constellation.index"),
		
		model: GridDataModel,
		
		initialize: function() {
			
		}
	});
	
	return new CacheModel();
});