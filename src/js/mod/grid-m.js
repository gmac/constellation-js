/**
* Grid Model.
* Main application model for managing node and polygon data.
*/
define([
	'lib/backbone',
	'lib/underscore',
	'lib/constellation',
	'lib/store'
],
function( Backbone, _, Const, store, cacheModel ) {
	
	var updateMethods = [
		'addNode',
		'joinNodes',
		'splitNodes',
		'removeNodes',
		'addPolygon',
		'removePolygons',
		'reset'
	];
	
	var gridModel = _.extend(new Const.Grid(), Backbone.Events, {
		
		init: function() {
			this.listenTo(this, 'change', this.save);

			var self = this;
			
			// Override all grid mutators with event-firing method wrappers:
			_.each(updateMethods, function(methodName) {
				self[ methodName ] = function() {
					Const.Grid.prototype[ methodName ].apply(self, arguments);
					self.update();
				};
			});
			
			return this;
		},
		
		// Loads current cache selection into the model:
		load: function() {
			var data = store.get('constellation');
			this.reset(data);
		},
		
		// Saves current model data into the cache:
		save: function(id) {
			store.set('constellation', this.toJSON());
		},
		
		update: function() {
			this.trigger('change');
		}
	});
	
	return gridModel.init();
});