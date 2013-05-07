/**
* Tools View controls.
* Configures user interface wired for calling controller methods.
*/
define([
	'lib/jquery',
	'lib/underscore',
	'lib/backbone',
	'./grid-m',
	'./grid-c',
	'./window-v'
],
function( $, _, Backbone, gridModel, gridController, windowView ) {
	
	var ToolsView = Backbone.View.extend({
		el: '#toolbar',
		
		initialize: function() {
			//this.$grids = this.$('select');
			this.listenTo(gridModel, 'change', this.render);
			this.render();
		},
		
		render: function() {
			this.$('.bg-url').val(gridModel.bg);
		},
		
		// Renders the list of grid ids.
		/*setGrids: function() {
			var opts = '';
			cacheModel.each(function( model ) {
				opts += '<option value="'+ model.get('uid') +'">'+ model.get('name') +'</option>';
			});
			
			this.$grids.empty().html( opts );
			//this.$grids[0].selectedIndex = cacheModel.selectedIndex();
		},*/
		
		events: {
			'click .action': 'onAction',
			'click .bg-load': 'onBgLoad',
			'click .bg-clear': 'onBgClear',
			'click .bg-demo': 'onBgDemo',
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
		},
		
		onBgLoad: function(evt) {
			gridModel.setBackground(this.$('.bg-url').val());
			evt.preventDefault();
		},
		
		onBgClear: function(evt) {
			gridModel.setBackground('');
			evt.preventDefault();
		},
		
		onBgDemo: function(evt) {
			var url = $(evt.currentTarget).attr('href');
			gridModel.setBackground(url);
			evt.preventDefault();
		}
	});
	
	return new ToolsView();
});