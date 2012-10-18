define([
	'lib/jquery',
	'lib/underscore',
	'lib/backbone',
	'mod/model-grid',
	'mod/model-selection',
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
				local,
				foreign,
				i,
				j;
			
			// Assemble line/beam relationships.
			for (i in nodes) {
				if ( nodes.hasOwnProperty(i) ) {
					local = nodes[i];
					
					for (j in local.to) {
						if ( local.to.hasOwnProperty(j) && nodes.hasOwnProperty(j) ) {
							foreign = nodes[j];

							if ( !lines.hasOwnProperty(foreign.id+' '+local.id) ) {
								lines[local.id+' '+foreign.id] = {
									id: local.id+' '+foreign.id,
									x1:local.x, 
									y1: local.y,
									x2: foreign.x,
									y2: foreign.y
								};
							}
						}
					}
				}
			}
			
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
			var nodes = selectModel.getNodeQuery();
			this.$el.find('li').removeClass('select').filter(nodes).addClass('select');
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

					for (id in model.to) {
						if ( model.to.hasOwnProperty(id) ) {
							foreign = gridModel.getNodeById(id);
							line = lines[i++];

							if (line) {
								line.setAttribute('x1', model.x);
								line.setAttribute('y1', model.y);
								line.setAttribute('x2', foreign.x);
								line.setAttribute('y2', foreign.y);
							}
						}
					}
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
				if ( selectModel.toggleNode( target.attr('id'), evt.shiftKey) ) {
					this.dragNode( target );
				}
				
			} else {
				gridModel.addNode(coords.left, coords.top);
			}
		}
	});
	
	return new GridView();
});