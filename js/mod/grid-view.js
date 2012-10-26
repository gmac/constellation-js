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
		viewSelection: [],
		
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
			gridModel.on( gridModel.events.CHANGE, self.render, self );
			gridModel.on( gridModel.events.CHANGE, self.setFrame, self );
			windowService.on( windowService.RESIZE, self.setFrame, self );
			selectModel.on( selectModel.UPDATE, self.setSelection, self );
			
			// Set initial viewport.
			self.setFrame();
		},
		
		// Generates a polygon drawing path based on polygon model.
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
				nodes = gridModel.nodes,
				foreign,
				i;
			
			// Assemble polygon drawings.
			_.each(gridModel.polys, function(poly, id) {
				polys[ poly.id ] = {
					id: poly.id,
					clss: poly.nodes.join(' '),
					d: self.getPolygonPath(poly)
				};
			});
			
			// Assemble line drawings.
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
			
			// Generate and set new view template.
			this.$el.html( this.tmpl({
				nodes: nodes,
				lines: lines,
				polys: polys
			}) );
			
			// Refresh view selection.
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
		// Kinda messy here given that jQuery doesn't handle DOM and SVG the same way...
		setSelection: function() {
			var self = this;
			
			// Clear any existing selection.
			_.each(this.viewSelection, function(item) {
				item = $(item);
				
				if ( item.is('path') ) {
					// POLYGON view item.
					item[0].setAttribute('class', item[0].getAttribute('class').replace(/[\s]?select/g, ''));
				} else {
					// NODE view item.
					item.removeClass('select').children(':first-child').text('');
				}
			});
			
			// Reset view selection.
			this.viewSelection.length = 0;
			
			// Select all items in the selection model.
			_.each(selectModel.items, function(id, i) {
				item = self.$el.find('#'+id);
				
				if ( item.is('path') ) {
					// POLYGON view item.
					item[0].setAttribute('class', item[0].getAttribute('class') + " select");
				} else {
					// NODE view item.
					item.addClass('select').children(':first-child').text(i+1);
				}
				
				// Add item reference to the view selection queue.
				self.viewSelection.push(item[0]);
			});
		},
		
		// Gets the localized offset of event coordinates within the grid frame.
		localizeEventOffset: function( evt ) {
			var offset = this.$el.offset();
			offset.left = evt.pageX - offset.left;
			offset.top = evt.pageY - offset.top;
			return offset;
		},
		
		// Apply drag-drop behavior to a node view.
		dragNode: function( id, view ) {
			var self = this,
				model = gridModel.getNodeById(id),
				lines = self.$el.find('line.'+id),
				polys = self.$el.find('path.'+id),
				min = Math.min,
				max = Math.max,
				maxX = (gridModel.get('width') || self.$el.width()),
				maxY = (gridModel.get('height') || self.$el.height());
			
			// Configure drag-drop events.
			$(document)
				.on('mouseup', function() {
					$(document).off('mouseup mousemove');
					model = view = lines = polys = min = max = null;
				})
				.on('mousemove', function( evt ) {
					var coords = self.localizeEventOffset(evt),
						current = new RegExp(id+'$|'+id+'\\s|\\s', 'g'),
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
		
		// Apply drag-drop behavior to a polygon view.
		dragPoly: function( id, view ) {
			
		},
		
		// Generic event handler triggered by any mousedown/touch event.
		onTouch: function( evt ) {
			var target = $(evt.target),
				id;
			
			target = target.is('li > span') ? target.parent() : target;
			id = target.attr('id');
			
			// Clear existing selection unless Shift-key is pressed,
			// silently if a valid element was clicked.
			if (!evt.shiftKey) {
				selectModel.deselectAll( !!id );
			}
			
			if ( target.is('li') ) {
				// NODE was touched.
				if ( selectModel.toggle(id) ) {
					this.dragNode(id, target);
				}
			
			} else if ( target.is('path') ) {
				// POLYGON was touched.
				if ( selectModel.toggle(id) ) {
					this.dragPoly(id, target);
				}
				
			} else if (evt.shiftKey) {
				// CANVAS click. Add new node.
				target = this.localizeEventOffset(evt);
				id = gridModel.addNode(target.left, target.top);
				selectModel.select( id );
			}
			
			return false;
		}
	});
	
	return new GridView();
});