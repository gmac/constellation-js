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
			// Generate grid view template.
			self.tmpl = _.template( $('#grid-view').html() );
			
			// Add event listeners.
			gridModel.on( gridModel.RENDER, self.render, self );
			gridModel.on( gridModel.CHANGE, self.setFrame, self );
			windowService.on( windowService.RESIZE, self.setFrame, self );
			selectModel.on( selectModel.UPDATE, self.setSelection, self );
			
			// Set initial viewport.
			self.setFrame();
		},
		
		getPolygonPath: function( model ) {
			var draw = '',
				node,
				i;
			
			for ( i = 0; i < model.sides; i++ ) {
				node = gridModel.getNodeById( model.nodes[i] );
				
				if (node) {
					draw += (i <= 0 ? 'M' : 'L') + node.x +' '+ node.y +' ';
				}
			}
			return draw+'Z';
		},
		
		// Renders all nodes, lines, and polygons within the display.
		render: function() {
			var self = this,
				lines = {},
				polys = {},
				nodes = gridModel.getNodes(),
				foreign,
				i;
			
			// Assemble polygon drawings.
			_.each(gridModel.getPolys(), function(poly, id) {
				polys[ poly.id ] = {
					id: poly.id,
					clss: poly.nodes.join(' '),
					d: self.getPolygonPath(poly)
				};
			});
			
			// Assemble node drawings.
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

			var view = this.tmpl({
				nodes: nodes,
				lines: lines,
				polys: polys
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
			var nodes = this.$el
				.find('ul').children() // Get all line items (faster ul > children reference).
				.removeClass('select'); // Remove all 'select' classes.
				
			nodes.children(':first-child').text('');
			
			// find each selected node view; select it an set index.
			_.each(selectModel.nodes, function(id, i) {
				nodes.filter('#'+id)
					.addClass('select')
					.children(':first-child')
					.text(i+1);
			});
		},
		
		// Gets the localized offset of event coordinates within the grid frame.
		localizeEventOffset: function( evt ) {
			var offset = this.$el.offset();
			offset.left = evt.pageX - offset.left;
			offset.top = evt.pageY - offset.top;
			return offset;
		},
		
		// Apply drag-n-drop behavior to a node view.
		dragNode: function( view ) {
			var self = this,
				id = view.attr('id'),
				model = gridModel.getNodeById(id),
				lines = self.$el.find('line.'+id),
				polys = self.$el.find('path.'+id),
				min = Math.min,
				max = Math.max,
				maxX = (gridModel.get('width') || self.$el.width()),
				maxY = (gridModel.get('height') || self.$el.height());
			
			$(document)
				.on('mouseup', function() {
					$(document).off('mouseup mousemove');
					model = view = lines = polys = min = max = null;
				})
				.on('mousemove', function( evt ) {
					var coords = self.localizeEventOffset(evt),
						current = new RegExp(id+'|\\s', 'g'),
						foreign;

					// Set view position and model coordinates.
					view.css({
						left: ( model.x = max(0, min(coords.left, maxX)) ),
						top: ( model.y = max(0, min(coords.top, maxY)) )
					});
					
					// Update all lines.
					lines.each(function(i, view) {
						foreign = gridModel.getNodeById( view.getAttribute('class').replace(current, '') );
						view.setAttribute('x1', model.x);
						view.setAttribute('y1', model.y);
						view.setAttribute('x2', foreign.x);
						view.setAttribute('y2', foreign.y);
					});
					
					// Update all polys.
					polys.each(function(i, view) {
						var poly = gridModel.getPolygonById( view.getAttribute('id') );
						view.setAttribute('d', self.getPolygonPath(poly) );
					});
					
					return false;
				});
		},
		
		touchPoly: function( view ) {
			
		},
		
		// Generic event handler triggered by any mousedown/touch event.
		onTouch: function( evt ) {
			var coords = this.localizeEventOffset(evt),
				target = $(evt.target);
			
			if ( target.is('li > span') ) {
				// NODE was touched.
				target = target.parent();
				
				// Toggle node selection, then proceed to drag if selected.
				if ( selectModel.toggleNode(target.attr('id'), evt.shiftKey) ) {
					this.dragNode(target);
				}
			
			} else if ( target.is('path') ) {
				// POLYGON was touched.
				this.touchPoly( target );
				
			} else {
				// CANVAS click. Add new node.
				gridModel.addNode(coords.left, coords.top);
			}
			
			return false;
		}
	});
	
	return new GridView();
});