/**
* Tools View controls.
* Configures user interface wired for calling controller methods.
*/
define([
	'lib/jquery',
	'lib/underscore',
	'lib/backbone',
	'mod/grid-m',
	'mod/cache-m',
	'mod/grid-c',
	'mod/keyboard-c',
	'mod/window-v'
],
function( $, _, Backbone, gridModel, cacheModel, gridController, keystroke, windowView ) {
	
	var ToolsView = Backbone.View.extend({
		el: '#toolbar',
		
		initialize: function() {
			var self = this;
			this.y = $('.header').outerHeight();
			
			windowView.on(windowView.RESIZE, this.render, this);
			this.render();
			
			//this.update();
			
			//gridIndex.on('reset add', this.setGridsList, this);
			//gridModel.on('change', this.update, this);
		},
		
		render: function() {
			this.$el.height( windowView.height - this.y );
		},
		
		// Renders the list of grid ids.
		setGridsList: function() {
			var opts = '';
			gridIndex.each(function( model ) {
				opts += '<option value="'+ model.id +'">'+ model.attributes.name +'</option>';
			});
			
			//this.$list.empty().html( opts );
			//this.$list.val( gridModel.id );
		},
		
		events: {
			'click .join': 'onJoin',
			'click .break': 'onBreak',
			'click .polygon': 'onPolygon',
			'click .funct-path': 'onFindPath',
			'click .funct-nearest': 'onNearestPoint',
			'click .funct-snap': 'onSnapPoint',
			'click .funct-hittest': 'onHitTestPoly'
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
		
		onChangeGrid: function() {
			gridController.loadGrid( parseInt(this.$list.val(), 10) );
		},
		
		update: function() {
			this.$list.find(':selected').text( gridModel.get('name') );
		}
	});
	
	return new ToolsView();
});