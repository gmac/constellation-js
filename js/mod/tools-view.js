define([
	'lib/jquery',
	'lib/backbone',
	'mod/grid-model',
	'mod/grid-selection-model'
],
function( $, Backbone, gridModel, selectModel ) {
	
	var ToolsView = Backbone.View.extend({
		el: '#tools',
		model: gridModel,
		events: {
			'click .action-join': 'joinNodes',
			'click .action-split': 'splitNodes',
			'click .action-polygon': 'makePolygon',
			'click .action-delete': 'deleteGeometry',
			'click .toggle-menu h2': 'toggleMenu',
			'blur #view-width': 'setFrame',
			'blur #view-height': 'setFrame',
		},
		
		initialize: function() {
			var self = this;
			
			this.$width = $('#view-width');
			this.$height = $('#view-height');
			//this.model.on('change', this.update, this);
			this.update();
		},
		
		render: function() {
			// Do nothing.
		},
		
		joinNodes: function() {
			gridModel.joinNodes( selectModel.getNodeSelection() );
		},
		splitNodes: function() {
			gridModel.splitNodes( selectModel.getNodeSelection() );
		},
		makePolygon: function() {
			console.log('polygon');
		},
		deleteGeometry: function() {
			gridModel.removeNodes( selectModel.getNodeSelection() );
			selectModel.deselectAllNodes();
		},
		toggleMenu: function( evt ) {
			var target = $(evt.target).closest('.toggle-menu').toggleClass('open');
			$('.toggle-menu').not(target).removeClass('open');
		},
		setFrame: function() {
			gridModel.set({
				width: (parseInt(this.$width.val(), 10) || ''),
				height: (parseInt(this.$height.val(), 10) || '')
			});
			this.update();
		},
		update: function() {
			this.$width.val( this.model.get('width') );
			this.$height.val( this.model.get('height') );
		}
	});
	
	return new ToolsView();
});