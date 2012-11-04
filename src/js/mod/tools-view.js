/**
* Tools View controls.
* Configures user interface wired for calling controller methods.
*/
define([
	'lib/jquery',
	'lib/underscore',
	'lib/backbone',
	'mod/grid-model',
	'mod/grid-index-model',
	'mod/grid-controller',
	'mod/tools-keyboard'
],
function( $, _, Backbone, gridModel, gridIndex, gridController, keystroke ) {
	
	var ToolsView = Backbone.View.extend({
		el: '#tools',
		
		events: {
			'click button.action': 'onSelectTask',
			'click .toggle-menu h2': 'onToggleMenu',
			'change #grids-list': 'onChangeGrid',
			'blur #view-width,#view-height,#grid-name': 'onSetAttr'
		},
		
		initialize: function() {
			var self = this;
			this.$list = this.$el.find('#grids-list');
			this.$width = this.$el.find('#view-width');
			this.$height = this.$el.find('#view-height');
			this.$name = this.$el.find('#grid-name');
			this.update();
			
			gridIndex.on('reset add', this.setGridsList, this);
			gridModel.on('change', this.update, this);
		},
		
		render: function() {
			// Do nothing.
		},
		
		// Renders the list of grid ids.
		setGridsList: function() {
			var opts = '';
			gridIndex.each(function( model ) {
				opts += '<option value="'+ model.id +'">'+ model.attributes.name +'</option>';
			});
			
			this.$list.empty().html( opts );
			this.$list.val( gridModel.id );
		},
		
		// Performs a basic grid controller task based on a button click.
		onSelectTask: function(evt) {
			var type = evt.target.className.replace(/action|\s/g, '');
			
			switch (type) {
				case 'join': gridController.joinNodes(); break;
				case 'split': gridController.splitNodes(); break;
				case 'polygon': gridController.joinNodes(); break;
				case 'delete': gridController.deleteGeometry(); break;
			}
		},
		
		onToggleMenu: function( evt ) {
			var target = $(evt.target).closest('.toggle-menu').toggleClass('open');
			$('.toggle-menu').not(target).removeClass('open');
		},
		
		onChangeGrid: function() {
			gridController.loadGrid( parseInt(this.$list.val(), 10) );
		},
		
		onSetAttr: function() {
			gridModel.set({
				width: (parseInt(this.$width.val(), 10) || ''),
				height: (parseInt(this.$height.val(), 10) || ''),
				name: this.$name.val()
			});
			
			// Force update to refresh invalidated fields.
			this.update();
		},
		
		update: function() {
			this.$width.val( gridModel.get('width') );
			this.$height.val( gridModel.get('height') );
			this.$name.val( gridModel.get('name') );
			this.$list.find(':selected').text( gridModel.get('name') );
		}
	});
	
	return new ToolsView();
});