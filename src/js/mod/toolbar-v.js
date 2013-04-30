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
			windowView.on(windowView.RESIZE, this.setFrame, this);
			cacheModel.on('reset add remove', this.setGrids, this);
			cacheModel.on('select', this.render, this);
			this.$grids = this.$('select');
			this.setFrame();
		},
		
		render: function() {
			
		},
		
		setFrame: function() {
			this.y = this.y || $('.header').outerHeight();
			this.$el.height( windowView.height - this.y );
		},
		
		// Renders the list of grid ids.
		setGrids: function() {
			var opts = '';
			cacheModel.each(function( model ) {
				opts += '<option value="'+ model.id +'">'+ model.get('name') +'</option>';
			});
			
			this.$grids.empty().html( opts );
			this.$grids[0].selectedIndex = cacheModel.selectedIndex();
		},
		
		events: {
			'click .join': 'onJoin',
			'click .break': 'onBreak',
			'click .polygon': 'onPolygon',
			'click .funct-path': 'onFindPath',
			'click .funct-nearest': 'onNearestPoint',
			'click .funct-snap': 'onSnapPoint',
			'click .funct-hittest': 'onHitTestPoly',
			'change select': 'onSelectGrid'
		},
		
		onJoin: function() {
			gridController.joinNodes();
		},
		
		onBreak: function() {
			gridController.splitNodes();
		},
		
		onPolygon: function() {
			gridController.makePolygon();
		},
		
		onFindPath: function() {
			gridController.runPathfinder();
		},
		
		onNearestPoint: function() {
			gridController.snapNodeToGrid();
		},
		
		onSnapPoint: function() {
			gridController.snapNodeToGrid();
		},
		
		onHitTestPoly: function() {
			gridController.hitTestNodeInPolygons();
		},
		
		onSelectGrid: function() {
			cacheModel.selectedIndex( this.$grids[0].selectedIndex );
		}
	});
	
	return new ToolsView();
});