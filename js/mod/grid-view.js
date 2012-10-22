define([
	'lib/jquery',
	'lib/underscore',
	'lib/backbone',
	'mod/grid-model',
	'mod/grid-selection-model',
	'mod/service-window'
],
function( $, _, Backbone, gridModel, selectModel, windowService ) {
	
	var GridView = Backbone.View.extend({
		el: '#grid',
		model: gridModel,
		
		// Define view event patterns.
		events: {
			'mousedown': 'onTouch'
		},
		
		// View initializer.
		initialize: function() {
			var self = this;
			gridModel.on( gridModel.RENDER, this.render, this );
			gridModel.on( gridModel.CHANGE, this.setFrame, this );
			windowService.on( windowService.RESIZE, this.setFrame, this );
			selectModel.on( selectModel.UPDATE, this.setSelection, this );
			this.setFrame();
		},
		
		// Renders all nodes, lines, and polygons within the display.
		render: function() {
			var lines = {},
				nodes = gridModel.getData().nodes,
				foreign,
				i;
			
			// Assemble line/beam relationships.
			_.each(nodes, function(local, id) {
				for (i in local.to) {
					if ( local.to.hasOwnProperty(i) && nodes.hasOwnProperty(i) ) {
						foreign = nodes[i];

						if ( !lines.hasOwnProperty(foreign.id+' '+local.id) ) {
							lines[local.id+' '+foreign.id] = {
								id: local.id+' '+foreign.id,
								x1: local.x, 
								y1: local.y,
								x2: foreign.x,
								y2: foreign.y
							};
						}
					}
				}
			});
			
			if (!this.tmpl) {
				this.tmpl = _.template( $('#grid-view').html() );
			}
			
			var view = this.tmpl({
				nodes: nodes,
				lines: lines
			});
			
			this.$el.html( view );
			this.setSelection();
		},
		
		// Resets the work area frame dimensions and background image.
		setFrame: function() {
			var w = gridModel.get('width'),
				h = gridModel.get('height'),
				m = w ? 'auto' : 10,
				top = 45;
			
			this.$el.width( w ).css({marginLeft: m, marginRight: m});
			
			m = h ? (windowService.height - top - h) / 2 : 10;
			h = h ? h : windowService.height - top - m * 2;
			this.$el.height( h ).css({marginTop: top + m});
		},
		
		// Configures appearance of the selected geometry state.
		setSelection: function() {
			var nodes = this.$el.find('li').removeClass('select'),
				selection = selectModel.getNodeSelection(),
				i;
			
			nodes.children(':first-child').text('');

			for (i in selection) {
				nodes.filter('#'+i)
					.addClass('select')
					.children(':first-child')
					.text( selection[i].index+1 );
			}
		},
		
		// Gets the localized offset of event coordinates within the grid frame.
		localizeEventOffset: function( evt ) {
			var offset = this.$el.offset();
			offset.left = evt.pageX - offset.left;
			offset.top = evt.pageY - offset.top;
			return offset;
		},
		
		dragNode: function( view ) {
			var id = view.attr('id'),
				model = gridModel.getNodeById(id),
				lines = $('line.'+id),
				self = this;
			
			$(document)
				.on('mouseup', function() {
					$(document).off('mouseup mousemove');
					model = view = lines = null;
				})
				.on('mousemove', function( evt ) {
					var coords = self.localizeEventOffset(evt),
						i = 0,
						foreign,
						line,
						id;

					view.css({
						left: (model.x = coords.left),
						top: (model.y = coords.top)
					});

					_.each(model.to, function(val, id) {
						foreign = gridModel.getNodeById(id);
						line = lines[i++];

						if (line) {
							line.setAttribute('x1', model.x);
							line.setAttribute('y1', model.y);
							line.setAttribute('x2', foreign.x);
							line.setAttribute('y2', foreign.y);
						}
					});
					return false;
				});
		},
		
		touchPoly: function( item ) {
			
		},
		
		// Generic event handler triggered by any mousedown/touch event.
		onTouch: function( evt ) {
			var coords = this.localizeEventOffset(evt),
				target = $(evt.target);

			if ( target.is('li > span') ) {
				// NODE was touched
				target = target.parent();
				
				// Toggle node selection, then proceed to drag if selected.
				if ( selectModel.toggleNode(target.attr('id'), evt.shiftKey) ) {
					this.dragNode(target);
				}
				
			} else {
				gridModel.addNode(coords.left, coords.top);
			}
			
			return false;
		}
	});
	
	return new GridView();
});