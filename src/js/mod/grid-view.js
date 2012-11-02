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
			'mousedown': 'onTouch',
			'dblclick': 'onDouble'
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
		getPathForNodes: function( ring ) {
			var draw = '';
			
			_.each( ring, function( node, index ) {
				draw += (index <= 0 ? 'M' : 'L') + node.x +' '+ node.y +' ';
			});
			
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
					nodes: poly.nodes.join(' '),
					d: self.getPathForNodes( gridModel.getNodesForPolygon( poly.id ) )
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
		
		// Clears any existing view selection.
		clearSelection: function() {
			_.each(this.viewSelection, function(item) {
				item = $(item);
				
				if ( item.is('li') ) {
					// NODE view item.
					item.removeClass('select').children(':first-child').text('');
				} else {
					// POLYGON view item.
					item[0].setAttribute('class', item[0].getAttribute('class').replace(/[\s]?select/g, ''));
				}
			});
			
			this.viewSelection.length = 0;
		},
		
		// Configures appearance of the selected geometry state.
		// Kinda messy here given that jQuery doesn't handle DOM and SVG the same way...
		setSelection: function() {
			var self = this;
			this.clearSelection();
			
			// Select all items in the selection model.
			_.each( selectModel.items, function( item, i ) {
				item = self.$el.find( '#'+item );

				if ( item.is('li') ) {
					// NODE view item.
					item.addClass('select').children(':first-child').text(i+1);
				} else {
					// POLYGON view item.
					item[0].setAttribute('class', item[0].getAttribute('class')+" select");
				}
				
				// Add item reference to the view selection queue.
				self.viewSelection.push(item[0]);
			});
			
			// Highlight path selection.
			if ( selectModel.path.length ) {
				var path = [];
				for ( var i = 0, len = selectModel.path.length-1; i < len; i++ ) {
					path.push( 'line.'+selectModel.path[i]+'.'+selectModel.path[i+1] );
				}
				
				$( path.join(',') ).each(function( index, item ) {
					item.setAttribute('class', item.getAttribute('class')+" select");
					self.viewSelection.push( item );
				});
			}
		},
		
		// Gets the localized offset of event coordinates within the grid frame.
		localizeEventOffset: function( evt ) {
			var offset = this.$el.offset();
			offset.left = evt.pageX - offset.left;
			offset.top = evt.pageY - offset.top;
			return offset;
		},
		
		// Manages a click-and-drag sequence.
		// Injects a localized event offset into the behavior handlers.
		drag: function( move, release ) {
			var self = this;
			
			$(document)
				.on('mouseup', function( evt ) {
					$(document).off('mouseup mousemove');
					if ( typeof release === 'function' ) {
						release( self.localizeEventOffset(evt) );
					}
					return false;
				})
				.on('mousemove', function( evt ) {
					move( self.localizeEventOffset(evt) );
					return false;
				});
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
			this.drag(function( offset ) {
				// Drag.
				var current = new RegExp(id+'$|'+id+'\\s|\\s', 'g'),
					foreign;

				// Set view position and model coordinates.
				view.css({
					left: ( model.x = max(0, min(offset.left, maxX)) ),
					top: ( model.y = max(0, min(offset.top, maxY)) )
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
					var nodes = gridModel.getNodesForPolygon( view.getAttribute('id') );
					view.setAttribute('d', self.getPathForNodes( nodes ) );
				});
			});
		},
		
		// Apply drag-drop behavior to a polygon view.
		dragPoly: function( id, view, evt ) {
			var self = this,
				nodeIds = gridModel.getPolygonById( id ).nodes,
				nodeView = this.$el.find( '#'+nodeIds.join(',#') ),
				lineView = this.$el.find( 'line.'+nodeIds.join(',line.') ),
				polyView = this.$el.find( 'path.'+nodeIds.join(',path.') ),
				offset = this.localizeEventOffset( evt );
			
			this.drag(function( pos ) {
				// Drag.
				offset.left -= pos.left;
				offset.top -= pos.top;
				
				// Offset nodes.
				nodeView.each(function() {
					var node = $(this),
						model = gridModel.getNodeById( node.attr('id') );
						
					node.css({
						left: (model.x -= offset.left),
						top: (model.y -= offset.top)
					});
				});
				
				// Update lines.
				lineView.each(function() {
					var to = this.getAttribute('class').split(' '),
						a = gridModel.getNodeById( to[0] ),
						b = gridModel.getNodeById( to[1] );
					this.setAttribute('x1', a.x);
					this.setAttribute('y1', a.y);
					this.setAttribute('x2', b.x);
					this.setAttribute('y2', b.y);
				});
				
				// Update polys.
				polyView.each(function() {
					var poly = this.getAttribute('id'),
						nodes = gridModel.getNodesForPolygon( poly );
					this.setAttribute( 'd', self.getPathForNodes( nodes ) );
				});
				
				offset = pos;
			});
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
					this.dragNode(id, target, evt);
				}
			
			} else if ( target.is('path') ) {
				// POLYGON was touched.
				if ( selectModel.toggle(id) ) {
					this.dragPoly(id, target, evt);
				}
				
			} else if (evt.shiftKey) {
				// CANVAS click. Add new node.
				target = this.localizeEventOffset(evt);
				id = gridModel.addNode(target.left, target.top);
				selectModel.select( id );
			}
			
			return false;
		},
		
		onDouble: function( evt ) {
			var target = $(evt.target);
			
			if ( target.is('path') ) {
				var nodeIds = gridModel.getPolygonById( target.attr('id') ).nodes;
				console.log( nodeIds );
				selectModel.setSelection( nodeIds );
			}
		}
	});
	
	return new GridView();
});