define([
	'lib/jquery',
	'lib/backbone',
	'mod/grid-model',
	'mod/grid-controller',
	'mod/tools-keyboard'
],
function( $, Backbone, gridModel, gridController, keystroke ) {
	
	var ToolsView = Backbone.View.extend({
		el: '#tools',
		model: gridModel,
		
		events: {
			'click button.action': 'performTask',
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
		
		// Performs a basic grid controller task based on a button click.
		performTask: function(evt) {
			var type = evt.target.className.replace(/action|\s/g, '');
			
			switch (type) {
				case 'join': gridController.joinNodes(); break;
				case 'split': gridController.splitNodes(); break;
				case 'polygon': gridController.joinNodes(); break;
				case 'delete': gridController.deleteGeometry(); break;
			}
		},
		
		toggleMenu: function( evt ) {
			var target = $(evt.target).closest('.toggle-menu').toggleClass('open');
			$('.toggle-menu').not(target).removeClass('open');
		},
		
		setFrame: function() {
			//keyboard.disable();
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