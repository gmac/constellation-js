/**
* Tools View controls.
* Configures user interface wired for calling controller methods.
*/
define([
	'lib/jquery',
	'lib/underscore',
	'lib/backbone',
	'./cache-m',
	'./grid-m',
	'./grid-c',
	'./window-v'
],
function( $, _, Backbone, cacheModel, gridModel, gridController, windowView ) {
	
	var ToolsView = Backbone.View.extend({
		el: '#toolbar',
		
		initialize: function() {
			this.$grids = this.$('select');
			this.listenTo(cacheModel, 'reset add remove sync', this.setGrids);
			this.listenTo(cacheModel, 'select', this.render);
		},
		
		render: function() {
			
		},
		
		// Renders the list of grid ids.
		setGrids: function() {
			var opts = '';
			cacheModel.each(function( model ) {
				opts += '<option value="'+ model.get('uid') +'">'+ model.get('name') +'</option>';
			});
			
			this.$grids.empty().html( opts );
			//this.$grids[0].selectedIndex = cacheModel.selectedIndex();
		},
		
		events: {
			'click .action': 'onAction',
			'change select': 'onSelectGrid'
		},
		
		onAction: function(evt) {
			switch ( $(evt.currentTarget).attr('data-action') ) {
				case 'join': gridController.joinNodes(); return;
				case 'split': gridController.splitNodes(); return;
				case 'polygon': gridController.makePolygon(); return;
				case 'remove': gridController.deleteGeometry(); return;
				case 'path': gridController.findPath(); return;
				case 'snap': gridController.snapNodeToGrid(); return;
				case 'nearest': gridController.selectNearestGridNode(); return;
				case 'hittest': gridController.hitTestGeometry(); return;
				case 'print': gridController.print(); return;
			}
		},
		
		onSelectGrid: function() {
			//cacheModel.selectedIndex( this.$grids[0].selectedIndex );
		}
	});
	
	return new ToolsView();
});