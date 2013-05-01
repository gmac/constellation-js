// Cache Model for managing data.

define([
	'lib/backbone'
],
function( Backbone ) {
	
	// Grid Data
	// ---------
	// Stores data for an individual grid layout.
	var GridRecordModel = Backbone.Model.extend({
		defaults: {
			uid: 0,
			name: 'New Grid'
		}
	});
	
	// Cache
	// -----
	// Manages the collection of grid layout options.
	var CacheModel = Backbone.Collection.extend({
		
		model: GridRecordModel,
		localStorage: new Backbone.LocalStorage('constellation-index'),
		selectedModel: null,
		selectedIndex: -1,
		
		_uid: 0,

		initialize: function() {
			this.listenTo(this, 'sync', this.onSync);
		},
		
		onSync: function() {
			if (this.length) {
				this._uid = Math.max.apply(null, this.pluck('uid').concat([0]))+1;
				this.selectModelAt(0);
			} else {
				this.newRecord();
			}
		},
		
		// Creates a new record:
		newRecord: function() {
			this.create({uid:this._uid++});
			this.selectModelAt(this.length-1);
		},
		
		// Get / Set selected model index:
		selectModelAt: function( index ) {
			if (index !== this.selectedIndex && index >= 0 && index < this.length) {
				this.selectedIndex = index;
				this.selectedModel = this.at(index);
				this.trigger('select');
			}
			return this.selectedModel;
		}
	});
	
	return new CacheModel();
});