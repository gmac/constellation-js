define([
	'lib/jquery',
	'lib/underscore',
	'lib/backbone',
	'mod/grid-m',
	'mod/grid-selection-m',
	'mod/window-v'
],
function( $, _, Backbone, gridModel, selectModel, windowView ) {
	
	var GridView = Backbone.View.extend({
		el: '#grid',
		model: gridModel,
		selectedViews: [],
		lastTouch: 0,
		
		// Define view event patterns.
		events: {
			'mousedown': 'onTouch'
		},
		
		// View initializer.
		initialize: function() {
			var self = this;
			// Generate grid view template.
			self.tmpl = _.template( $('#grid-view').html() );
			self.x = parseInt(this.$el.css('margin-left').slice(0, -2), 10);
			self.y = $('.header').outerHeight();
			
			// Add event listeners.
			gridModel.on( 'change', self.render, self );
			windowView.on( windowView.RESIZE, self.setFrame, self );
			selectModel.on( selectModel.UPDATE, self.setSelection, self );
			
			// Set initial viewport.
			self.setFrame();
		},
		
		// Generates a polygon drawing path based on an array of node models.
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
			this.selectedViews.length = 0;
			this.setSelection();
		},
		
		// Resets the work area frame dimensions and background image.
		setFrame: function() {
			this.$el.width( windowView.width-this.x ).height( windowView.height-this.y );
		},
		
		// Actively clears "select" classes from selected view nodes.
		clearSelection: function() {
			_.each(this.selectedViews, function(item) {
				item = $(item);
				
				if ( item.is('li') ) {
					// NODE view item.
					item.removeClass('select').children(':first-child').text('');
				} else {
					// POLYGON view item.
					item[0].setAttribute('class', item[0].getAttribute('class').replace(/[\s]?select[\s]?/g, ''));
				}
			});
			
			this.selectedViews.length = 0;
		},
		
		// Actively sets "select" classes onto view node selection.
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
				self.selectedViews.push(item[0]);
			});
			
			// Highlight path selection.
			if ( selectModel.path.length ) {
				var path = [];
				for ( var i = 0, len = selectModel.path.length-1; i < len; i++ ) {
					path.push( 'line.'+selectModel.path[i]+'.'+selectModel.path[i+1] );
				}
				
				$( path.join(',') ).each(function() {
					this.setAttribute('class', this.getAttribute('class')+" select");
					self.selectedViews.push( this );
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
		
		// Manages a click-and-drag sequence behavior.
		// Injects a localized event offset into the behavior handlers.
		drag: function( onMove, onRelease, callback ) {
			var self = this;
			var dragged = false;
			
			$(document)
				.on('mouseup', function( evt ) {
					$(document).off('mouseup mousemove');
					if ( typeof onRelease === 'function' ) {
						onRelease( self.localizeEventOffset(evt) );
					}
					if ( typeof callback === 'function' ) {
						callback( dragged );
					}
					return false;
				})
				.on('mousemove', function( evt ) {
					dragged = true;
					onMove( self.localizeEventOffset(evt) );
					return false;
				});
		},
		
		// Drag all geometry views tethered to a group of nodes.
		dragGeom: function( nodeIds, offset, callback ) {
			var self = this,
				nodeView = this.$el.find( '#'+nodeIds.join(',#') ),
				lineView = this.$el.find( 'line.'+nodeIds.join(',line.') ),
				polyView = this.$el.find( 'path.'+nodeIds.join(',path.') );
			
			this.drag(function( pos ) {
				// Drag.
				offset.left -= pos.left;
				offset.top -= pos.top;
				
				// Update nodes.
				nodeView.each(function() {
					var node = $(this);
					var model = gridModel.getNodeById( node.attr('id') );

					node.css({
						left: (model.x -= offset.left),
						top: (model.y -= offset.top)
					});
				});

				// Update lines.
				lineView.each(function() {
					var to = this.getAttribute('class').split(' ');
					var a = gridModel.getNodeById( to[0] );
					var b = gridModel.getNodeById( to[1] );
					
					this.setAttribute('x1', a.x);
					this.setAttribute('y1', a.y);
					this.setAttribute('x2', b.x);
					this.setAttribute('y2', b.y);
				});

				// Update polys.
				polyView.each(function() {
					var poly = this.getAttribute('id');
					var nodes = gridModel.getNodesForPolygon( poly );
					
					this.setAttribute( 'd', self.getPathForNodes( nodes ) );
				});
				
				offset = pos;
			}, null, callback);
		},
		
		// Performs drag-bounds selection behavior.
		dragMarquee: function( offset ) {
			var view = $('#marquee').show();
			
			function plotRect( a, b ) {
				var minX = Math.min(a.left, b.left),
					maxX = Math.max(a.left, b.left),
					minY = Math.min(a.top, b.top),
					maxY = Math.max(a.top, b.top),
					rect = {
						x: minX,
						y: minY,
						left: minX,
						top: minY,
						width: maxX-minX,
						height: maxY-minY
					};
					
				view.css(rect);
				return rect;
			}
			
			plotRect( offset, offset );	

			this.drag(function( pos ) {
				// Drag.
				plotRect( offset, pos );	
				
			}, function( pos ) {
				// Drop.
				_.each( gridModel.getNodesInRect( plotRect(offset, pos) ), function( node ) {
					selectModel.select( node );
				});
				view.hide();
			});
		},
		
		// Triggered upon touching a node element.
		touchNode: function( id, pos, shiftKey, dblclick ) {
			// NODE touch.
			var selected = selectModel.contains( id ),
				added = false;
			
			if ( shiftKey ) {
				// Shift key is pressed: toggle node selection.
				selected = selectModel.toggle( id );
				added = true;
			}
			else if ( !selected ) {
				// Was not already selected: set new selection.
				selectModel.deselectAll();
				selectModel.select( id );
				selected = true;
			}
			
			if ( selected ) {
				// Node has resolved as selected: start dragging.
				this.dragGeom( selectModel.items, pos, function( dragged ) {
					// Callback triggered on release...
					// If the point was not dragged, nor a new addition to the selection
					// Then refine selection to just this point.
					if (!dragged && !added) {
						selectModel.deselectAll();
						selectModel.select( id );
					}
				});
			}
		},
		
		// Triggered upon touching a polygon shape.
		touchPoly: function( id, pos, shiftKey, dblclick ) {
			if ( dblclick ) {
				// Double-click polygon: select all nodes.
				var nodeIds = gridModel.getPolygonById( id ).nodes;
				selectModel.setSelection( nodeIds );
			}
			else {
				// Single-click polygon: perform selection box.
				if ( !shiftKey ) {
					selectModel.deselectAll();
				}
				if ( selectModel.toggle(id) ) {
					this.dragGeom( gridModel.getPolygonById( id ).nodes, pos);
				}
			}
		},
		
		// Triggered upon touching the canvas/background.
		touchCanvas: function( pos, shiftKey, dblclick ) {
			if ( dblclick ) {
				// Double-click canvas: add node.
				gridModel.addNode( pos.left, pos.top );
			}
			else {
				// Single-click canvas: activate selection marquee.
				if ( !shiftKey ) {
					selectModel.deselectAll();
				}
				this.dragMarquee( pos );
			}
		},
		
		// Generic handler for triggering view behaviors.
		onTouch: function( evt ) {
			var target = $(evt.target),
				time = new Date().getTime(),
				dblclick = (time - this.lastTouch < 250),
				pos = this.localizeEventOffset( evt ),
				id;
	
			target = target.is('li > span') ? target.parent() : target;
			id = target.attr('id');
			this.lastTouch = time;

			if ( target.is('li') ) {
				// Node
				this.touchNode( id, pos, evt.shiftKey, dblclick );
			} else if ( target.is('path') ) {
				// Poly
				this.touchPoly( id, pos, evt.shiftKey, dblclick );
			} else {
				// Canvas
				this.touchCanvas( pos, evt.shiftKey, dblclick );
			}
			return false;
		}
	});
	
	return new GridView();
});