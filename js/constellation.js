/**
* constellation.js
* A point-based grid layout and geometry search application by Greg MacWilliam.
* Released under MIT license.
*/

// JSLint options:
/*global $, jQuery, JSON, alert, prompt, confirm, console */
/*jslint browser: true, white: true, plusplus: true */

var constellation = (function() {
	"use strict";
	
	/**
	* Node definition.
	*/
	function Node(view, id, x, y, to) {
		this.id = id;
		this.to = (to || {});
		this.view = $('<div/>')
			.css({
				borderRadius: this.r*2,
				height: this.r*2,
				width: this.r*2
			})
			.attr({
				'class': 'node',
				id: this.id
			})
			.appendTo(view);
		
		this.plot(x||0, y||0);
		this.deselect();
	}
	
	Node.prototype = {
		id: '',
		x: 0,
		y: 0,
		r: 5,
		view: null,
		to: null,
		selection: 0,
		select: function(sel) {
			this.selection = sel;
			if (this.view) {
				this.view.text(sel).css('backgroundColor', '#f00');
			}
			return this;
		},
		deselect: function() {
			this.selection = 0;
			if (this.view) {
				this.view.text('').css('backgroundColor', '#900');
			}
			return this;
		},
		shift: function(inc) {
			this.selection = Math.max(0, this.selection+inc);
			if (this.view) {
				this.view.text(this.selection);
			}
			return this;
		},
		join: function(ids) {
			var i;
			for (i in ids) {
				if (ids.hasOwnProperty(i) && i !== this.id && !this.to.hasOwnProperty(i)) {
					this.to[i] = true;
				}
			}
		},
		split: function(ids) {
			var i;
			for (i in ids) {
				if (ids.hasOwnProperty(i) && this.to.hasOwnProperty(i)) {
					delete this.to[i];
				}
			}
		},
		plot: function(x, y) {
			this.x = x;
			this.y = y;
			if (this.view) {
				this.view.css({
					left: x-this.r,
					top: y-this.r
				});
			}
		},
		toData: function() {
			return {
				id: this.id,
				x: this.x,
				y: this.y,
				to: this.to
			};
		},
		destroy: function() {
			this.deselect();
			if (this.view) {
				this.view.remove();
				this.view = null;
			}
		}
	};
	
	Node.sortBySelection = function(a, b) {
		if (a.selection < b.selection) {
			return 1;
		} else if (a.selection > b.selection) {
			return -1;
		}
		return 0;
	};
	
	/**
	* Polygon definition.
	*/
	function Polygon(view, nodes) {
		var ids = [], i;
		this.nodes = nodes;
		this.sides = nodes.length;
		
		for (i=0; i < this.sides; i++) {
			ids.push( nodes[i].id );
		}
		
		this.id = '-'+ ids.join('-') +'-';
		this.view = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
		this.view.setAttribute("id", this.id);
		view.appendChild(this.view);
		
		this.render();
		this.select();
	}
	
	Polygon.prototype = {
		id: '',
		sides: 0,
		nodes: null,
		view: null,
		selected: null,
		contains: function( id ) {
			return this.id.indexOf( '-'+id+'-' ) >= 0;
		},
		toData: function() {
			var nodes = [],
				node,
				i;
			
			// Loop through and convert all nodes to raw data.
			// Remove the node connections table for this format.
			for (i=0; i < this.sides; i++) {
				node = this.nodes[i].toData();
				delete node.to;
				nodes.push(node);
			}
			return nodes;
		},
		render: function() {
			var coords = '',
				i,
				n;
			
			if (this.view) {
				
				// Loop through all sides in numeric order.
				for (i=0; i < this.sides; i++) {
					n = this.nodes[i];
					coords += (n.x+','+n.y+' ');
				}
				
				this.view.setAttribute("points", coords);
			}
		},
		select: function(sel) {
			sel = (sel || false);
			if (this.view && sel !== this.selected) {
				this.view.setAttribute("style", "fill:"+ (sel ? '#f00' : '#000') +";stroke:none;opacity:0.25;");
				this.selected = sel;
			}
		},
		destroy: function() {
			// Cleanup node references.
			if (this.nodes) {
				this.nodes.length = 0;
				this.nodes = null;
			}
			
			// Cleanup view references.
			if (this.view) {
				this.view.parentNode.removeChild(this.view);
				this.view = null;
			}
		}
	};
	
	/**
	* Encapsulated values.
	*/
	var _icount = 0,
		_startup = [],
		_selectedNodes = 0,
		_layoutName = '',
		_layoutSelect,
		_pathHighlight,
		_outputView,
		_gridView,
		_uiView,
		_svg;
		
	/**
	* Core application.
	*/
	return {
		selection: {},
		nodes: {},
		polys: {},

		// Lists all available saved grid layouts.
		listLayouts: function() {
			var i;
			
			function option(val, label) {
				return '<option value="'+ val +'">'+ label +'</option>';
			}
			
			if (!!_layoutSelect) {
				_layoutSelect.empty();
				_layoutSelect.append( option('', 'New Layout') );
				
				for (i in localStorage) {
					if (localStorage.hasOwnProperty(i)) {
						_layoutSelect.append( option(i, i) );
					}
				}
				
				_layoutSelect.val( _layoutName );
			}
		},
		
		// Loads a saved grid layout.
		loadLayout: function(name) {
			var data,
				node,
				poly,
				i,
				j;
			
			_icount = 0;
			_selectedNodes = 0;
			_layoutName = (name || '');
			
			// Purge all existing grid configuration.
			// Reset node grid.
			for (i in this.nodes) {
				if (this.nodes.hasOwnProperty(i)) {
					// remove node from selection.
					if (this.selection.hasOwnProperty(i)) {
						delete this.selection[i];
					}
					
					// destroy and remove node.
					this.nodes[i].destroy();
					delete this.nodes[i];
				}
			}
			
			// Reset poly grid.
			for (i in this.polys) {
				if (this.polys.hasOwnProperty(i)) {
					this.polys[i].destroy();
					delete this.polys[i];
				}
			}
			
			// Check for local storage record.
			if (_layoutName.length && !!localStorage[ _layoutName ]) {
				data = JSON.parse( localStorage[ _layoutName ] );
				
				// Parse nodes into node grid.
				for (i in data.nodes) {
					if (data.nodes.hasOwnProperty(i)) {
						node = data.nodes[i];
						node = new Node(_gridView, node.id, node.x, node.y, node.to);
						this.nodes[ node.id ] = node;
						_icount = Math.max(_icount, parseInt(node.id.substr(1), 10)+1);
					}
				}
				
				// Parse polys into polygon grid.
				for (i in data.polys) {
					if (data.polys.hasOwnProperty(i)) {
						poly = data.polys[i];
						
						// Swap in grid node data references for each polygon point.
						for (j in poly) {
							if (poly.hasOwnProperty(j)) {
								poly[j] = this.nodes[ poly[j].id ];
							}
						}
						
						// Create new polygon and add to poly grid.
						poly = new Polygon(_svg, poly);
						this.polys[ poly.id ] = poly;
					}
				}
			}
			
			// Select new layout within files list.
			if (!!_layoutSelect) {
				_layoutSelect.val(_layoutName);
			}
			
			this.resetView();
		},
		
		// Saves a grid layout.
		saveLayout: function() {
			var fname = prompt("Save layout as:", _layoutName);
			if (!!fname && fname.length) {
				_layoutName = fname;
				localStorage[ fname ] = JSON.stringify( this.toData() );
				this.listLayouts();
			}
		},
		
		// Deletes a grid layout from local storage.
		deleteLayout: function() {
			if (_layoutName.length && !!localStorage[ _layoutName ]) {
				if (confirm('Delete layout "'+ _layoutName +'"?')) {
					delete localStorage[ _layoutName ];
					_layoutName = '';
					this.listLayouts();
					this.loadLayout();
				}
			}
		},
		
		// Converts grid configuration to a simplified data collection.
		toData: function() {
			var i,
				data = {
					nodes: [],
					polys: []
				};
			
			// Store node data.
			for (i in this.nodes) {
				if (this.nodes.hasOwnProperty(i)) {
					data.nodes.push( this.nodes[i].toData() );
				}
			}
			
			// Store poly data.
			for (i in this.polys) {
				if (this.polys.hasOwnProperty(i)) {
					data.polys.push( this.polys[i].toData() );
				}
			}
			return data;
		},
		
		// Removes all geometry within the current selection group.
		// Selected nodes are detached from their connections and their polygons are removed.
		// Selected polygons are purged without modifying node grid.
		removeGeom: function() {
			var poly,
				i,
				j;
			
			if (_selectedNodes) {
				// Remove node selection.
				for (i in this.selection) {
					if (this.selection.hasOwnProperty(i)) {
						// Detach and destroy node.
						this.detachNode( i );
						this.selection[i].destroy();

						// Destroy and delete polygons with references.
						for (j in this.polys) {
							if (this.polys.hasOwnProperty(j)) {
								poly = this.polys[j];
								if (poly.contains(i)) {
									poly.destroy();
									delete this.polys[j];
								}
							}
						}

						// Delete node references.
						delete this.selection[i];
						delete this.nodes[i];
					}
				}
			} else {
				// Remove polygon selection.
				for (i in this.polys) {
					if (this.polys.hasOwnProperty(i)) {
						poly = this.polys[i];
						if (poly.selected) {
							j = true;
							poly.destroy();
							delete this.polys[i];
						}
					}
				}
				
				if (!j) {
					alert('No selected geometry to remove.');
				}
			}
			
			poly = null;
			_selectedNodes = 0;
			this.resetView();
		},
		
		// Adds a new node to the grid at the specified X and Y coordinates.
		addNode: function( x, y ) {
			var node = new Node(_gridView, 'n'+_icount++, x, y);
			this.nodes[ node.id ] = node;
			this.resetView();
			return node;
		},
		
		// Joins nodes within the current selection group.
		// All selected nodes will establish a joint to one another.
		joinNodes: function() {
			var i;
			if (_selectedNodes > 1) {
				for (i in this.selection) {
					if (this.selection.hasOwnProperty(i)) {
						this.selection[i].join( this.selection );
					}
				}
			} else {
				alert('Please select two or more grid nodes.');
			}
			this.resetView();
		},
		
		// Splits apart nodes in the current selection group.
		// All connections will be severed between the selected nodes.
		splitNodes: function() {
			var i;
			if (_selectedNodes > 0) {
				for (i in this.selection) {
					if (this.selection.hasOwnProperty(i)) {
						if (_selectedNodes > 1) {
							// Break apart multiple nodes.
							this.selection[i].split( this.selection );
						} else {
							// Sever single node.
							this.detachNode(i);
						}
					}
				}
			} else {
				alert('Please select one or more nodes with grid connections.');
			}
			this.resetView();
		},
		
		// Detachs a node from the grid.
		// Target node's connections will be severed from all joining nodes.
		detachNode: function( id ) {
			var to = this.nodes[ id ].to,
				i;
			
			// Break all connections between target and its defined to.
			for (i in to) {
				if (to.hasOwnProperty(i)) {
					delete this.nodes[i].to[id];
					delete to[i];
				}
			}
		},
		
		// Adds a given node ID to the current selection group.
		selectNode: function( id ) {
			_selectedNodes += 1;
			this.selection[ id ] = this.nodes[ id ].select(_selectedNodes);
		},
		
		// Removes a given node ID from the current selection group.
		deselectNode: function( id ) {
			var index,
				i;
				
			if ( this.selection.hasOwnProperty(id) ) {
				// Deselect target node.
				index = this.selection[id].selection;
				this.selection[id].deselect();
				delete this.selection[id];
				
				// Adjust indices of remaining selection to fill in empty slot.
				for (i in this.selection) {
					if ( this.selection.hasOwnProperty(i) && this.selection[i].selection > index ) {
						this.selection[i].shift(-1);
					}
				}
			}
			_selectedNodes -= 1;
		},
		
		// Removes all nodes from the current selection group.
		clearNodeSelection: function() {
			var i;
			for ( i in this.selection ) {
				if ( this.selection.hasOwnProperty(i) ) {
					this.selection[i].deselect();
					delete this.selection[i];
				}
			}
			_selectedNodes = 0;
		},
		
		// Specifies the current number of selected nodes.
		numSelections: function() {
			return _selectedNodes;
		},
		
		// Adds a new node to the grid at the specified X and Y coordinates.
		addPolygon: function() {
			var poly = [],
				i;
			
			if (_selectedNodes >= 3) {
				// Collect all polygon nodes.
				for (i in this.selection) {
					if (this.selection.hasOwnProperty(i)) {
						poly.push(this.selection[i]);
					}
				}

				// Sort nodes by selection order, then create a new polygon.
				poly.sort(Node.sortBySelection);
				poly = new Polygon(_svg, poly);
				this.polys[poly.id] = poly;
			} else {
				alert('Please select three or more grid nodes.');
			}
		},

		// Removes all polygons from the current selection group.
		clearPolygonSelection: function() {
			var i;
			for ( i in this.polys ) {
				if ( this.polys.hasOwnProperty(i) ) {
					this.polys[i].select(false);
				}
			}
		},
		
		// Called upon touching a node.
		// Determins what behaviors should occur as a result of the interaction.
		touchNode: function( id, shift ) {
			var sel = this.nodes[ id ].selection;

			if ( shift && sel ) {
				this.deselectNode(id);
			} else if ( shift && !sel ) {
				this.selectNode(id);
			} else {
				this.clearNodeSelection();
				this.selectNode(id);
			}
			
			this.clearPolygonSelection();
			this.resetView();
			
			if ( _selectedNodes === 1 ) {
				this.dragNode(id);
			}
		},
		
		// Manages the dragging of a node element.
		dragNode: function( id ) {
			var target = this.nodes[ id ];
			
			$(document)
				.bind('mousemove', function(evt) {
					target.x = evt.pageX;
					target.y = evt.pageY;
					target.view.css({
						left:evt.pageX-5,
						top:evt.pageY-5
					});
					constellation.render();
				})
				.bind('mouseup', function(evt) {
					$(document)
						.unbind('mousemove')
						.unbind('mouseup');
					target = null;
				});
		},
		
		// Called upon touching a node.
		// Determins what behaviors should occur as a result of the interaction.
		touchPolygon: function( id, shift ) {
			var poly = this.polys[id];
			
			if (shift && poly.selected) {
				poly.select(false);
			} else if (shift && !poly.selected) {
				poly.select(true);
			} else {
				this.clearPolygonSelection();
				poly.select(true);
			}
			
			this.clearNodeSelection();
			this.resetView();
		},
		
		// Finds a path between two points, and then highlights the grid route.
		getPath: function() {
			var targets = [],
				output,
				report,
				i,
				a,
				b;
			
			_pathHighlight = {};
			
			if (_selectedNodes === 2) {
				for (i in this.selection) {
					if (this.selection.hasOwnProperty(i)) {
						targets.push( this.nodes[i] );
					}
				}
				
				// Sort targets by selection index so that we search from 1 to 2.
				targets.sort(Node.sortBySelection);
				report = this.geom.findGridPath(targets.pop(), targets.pop(), this.nodes);
				
				// build key table of path sections to highlight.
				for (i=report.nodes.length-1; i>0; i--) {
					a = report.nodes[i];
					b = report.nodes[i-1];
					_pathHighlight[a.id+'-'+b.id] = true;
					_pathHighlight[b.id+'-'+a.id] = true;
				}
				
				// Render display with path highlight.
				this.render();
				
				// Print path info.
				if (report.valid) {
					output = '<strong>Length: '+ Math.round(report.length) +'px</strong> ('+ report.cycles +' search cycles)';
				} else {
					output = '<strong>No path</strong> ('+ report.cycles +' search cycles)';
				}
				this.ui.output(output);
				
			} else {
				alert('Please select exactly two grid nodes.');
			}
		},
		
		// Clears path highlight and pathfinder output information, then redraws the display.
		resetView: function() {
			_pathHighlight = null;
			this.ui.output();
			this.render();
		},
		
		// Redraws node connections with SVG lines.
		render: function() {
			var lines = $.makeArray(_svg.getElementsByTagName('line')),
				drawn = {},
				label,
				start,
				end,
				i,
				j;
				
			// Configures an SVG line segment.
			// New lines are created as needed.
			function setLine(from, to, hilite, node) {
				if (!node) {
					node = document.createElementNS('http://www.w3.org/2000/svg', 'line');
					//_svg.appendChild(node);
				}
				node.setAttribute("x1", from.x);
				node.setAttribute("y1", from.y);
				node.setAttribute("x2", to.x);
				node.setAttribute("y2", to.y);
				node.setAttribute("style", "stroke:"+ (hilite ? '#f00' : '#000') +";stroke-width:2;");
				_svg.appendChild(node);
			}
			
			// Render all polygons.
			for (i in this.polys) {
				if (this.polys.hasOwnProperty(i)) {
					this.polys[i].render();
				}
			}
			
			// Render all node connections.
			for (i in this.nodes) {
				if (this.nodes.hasOwnProperty(i)) {
					start = this.nodes[i];
					for (j in start.to) {
						if (start.to.hasOwnProperty(j) && this.nodes.hasOwnProperty(j)) {
							end = this.nodes[j];
							label = end.id+'-'+start.id;

							if (!drawn[label]) {
								setLine(start, end, (_pathHighlight && _pathHighlight[label]), lines.pop());
								drawn[start.id+'-'+end.id] = true;
							}
						}
					}
				}
			}
			
			// Purge extra SVG lines that are no longer needed.
			while (lines.length) {
				i = lines.pop();
				i.parentNode.removeChild(i);
			}
		},

		// Geometry utility functions.
		geom: {
			// Distance between two points.
			distance: function(a, b) {
				var h = b.x-a.x,
					v = b.y-a.y;
				return Math.sqrt(h*h + v*v);
			},
			
			// The square distance between two points.
			// (Faster measure for cases when actual distance doesn't matter.)
			sqdistance: function(a, b) {
				var h = b.x-a.x,
					v = b.y-a.y;
				return h*h + v*v;
			},
			
			// Tests for intersection between line segments AB and CD.
			intersect: function(a, b, c, d) {
				// Tests for counter-clockwise winding among three points.
				// Specifically written for intersection test:
				// Uses ">=" (rather than ">") to account for equal points.
				function ccw(x, y, z) {
					return (z.y-x.y) * (y.x-x.x) >= (y.y-x.y) * (z.x-x.x);
				}
				return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
			},
			
			// Tests if point P falls within a polygonal region; test performed by ray scan.
			// @param p: The point to test.
			// @param poly: An array of points forming a polygonal shape.
			// @return: true if point falls within polygon.
			hitTestPolygon: function(p, poly) {
				var sides = poly.length,
					origin = {x:0, y:p.y},
					hits = 0,
					s1,
					s2,
					i;
				
				// Test intersection of an external ray against each polygon side.
				for (i = 0; i < sides; i++) {
					s1 = poly[i];
					s2 = poly[(i+1) % sides];
					origin.x = Math.min(origin.x, Math.min(s1.x, s2.x)-1);
					hits += (this.intersect(origin, p, s1, s2) ? 1 : 0);
				}

				// Return true if an odd number of hits were found.
				return hits % 2 > 0;
			},
			
			// Snaps point P to the nearest position along line segment AB.
			// @param p: The point to snap.
			// @param a: An array of points forming a polygonal shape.
			// @param b: An array of points forming a polygonal shape.
			// @return: A new point object with "x" and "y" coordinates.
			snapPointToLine: function(p, a, b) {
				var ap1 = p.x-a.x,
					ap2 = p.y-a.y,
					ab1 = b.x-a.x,
					ab2 = b.y-a.y,
					mag = ab1*ab1 + ab2*ab2,
					dot = ap1*ab1 + ap2*ab2,
					t = dot/mag;

				if (t < 0) {
					return {x: a.x, y: a.y};
				} else if (t > 1) {
					return {x: b.x, y: b.y};
				}
				return {
					x: a.x + ab1*t,
					y: a.y + ab2*t
				};
			},
			
			// Finds the nearest point within an array of points to target P.
			// @param p: The point to test.
			// @param points: An array of points to find the nearest neighbor within.
			// @return: nearst point from list of points.
			findClosestPoint: function(p, points) {
				var i,
					a,
					dist,
					bestPt,
					bestDist = NaN,
					abs = Math.abs;

				// Sort points by horizontal offset from P.
				points.sort(function(a, b) {
					a = abs(p.x-a.x);
					b = abs(p.x-b.x);
					if (a < b) {
						return 1;
					} else if (a > b) {
						return -1;
					}
					return 0;
				});
				
				for (i=points.length-1; i >= 0; i--) {
					a = points[i];
					if (abs(p.x-a.x) < bestDist || isNaN(bestDist)) {
						dist = this.distance(p, a);
						if (dist < bestDist || isNaN(bestDist)) {
							bestPt = a;
							bestDist = dist;
						}
					} else {
						break;
					}
				}

				abs = null;
				return bestPt;
			},
			
			// Finds the shortest path between two nodes among the grid of nodes.
			// @param startNode: The node within the seach grid to start at.
			// @param goalNode: The node within the search grid to reach via shortest path.
			// @param searchGrid: The grid of nodes to search, formatted as:
			/* {
				n1: {id:"n1", x:25, y:25, to:{n2:true, n3:true}},
				n2: {id:"n2", x:110, y:110, to:{n1:true}},
				n3: {id:"n3", x:50, y:180, to:{n1:true}},
			};*/
			// @return: A report on the search, including:
			//  @attr length: length of completed path.
			//  @attr cycles: number of cycles required to complete the search.
			//  @attr nodes: an array of path nodes, formatted as [startNode, ...connections, goalNode].
			findGridPath: function(startNode, goalNode, searchGrid) {
				return {
					length: 0,
					cycles: 0,
					nodes: [startNode, goalNode]
				};
			}
		},
		
		// User-interface functions.
		ui: {
			// Adds a button to the interface.
			addButton: function(label, handler) {
				$('<button/>')
					.text(label)
					.click(handler)
					.appendTo(_uiView);
			},
			// Adds a divider into the interface.
			addDivider: function() {
				$('<span/>')
					.html('&nbsp;')
					.addClass('rule')
					.appendTo(_uiView);
			},
			// Prints a message into the output field.
			output: function(message) {
				if (_outputView && message) {
					_outputView.html(message).show();
				} else {
					_outputView.hide();
				}
			}
		},
		
		// Adds a task to the queue of startup items.
		// Queue will be run when application is initialized.
		ready: function(task) {
			if (typeof(task) === 'function') {
				_startup.push(task);
			}
		},
		
		// Initializes basic layout and functions of the grid application.
		// This method must be called upon document ready, before grid functions can be used.
		init: function( config ) {
			var body = $('body'),
				win = $(window);

			// Create node view container.
			_gridView = $('<div/>')
				.attr({id:'constellation-grid'})
				.prependTo(body)
				.mousedown(function(evt) {
					evt.preventDefault();
					var mx = evt.pageX,
						my = evt.pageY,
						target = $(evt.target);
					
					if (target.is('.node')) {
						constellation.touchNode(target.attr('id'), evt.shiftKey);
					} else if (target.is('polygon')) {
						constellation.touchPolygon(target.attr('id'), evt.shiftKey);
					} else {
						constellation.addNode(mx, my);
					}
				});
			
			// Create UI view container.
			_uiView = $('<div/>')
				.attr({id:'constellation-ui'})
				.appendTo(body);
			
			_layoutSelect = $('<select/>').change(function() {
				constellation.loadLayout($(this).val());
			});
			
			$('<div/>')
				.addClass('right')
				.append(_layoutSelect)
				.append($('<button/>').text('save').click(function() {
					constellation.saveLayout();
				}))
				.append($('<button/>').text('delete').click(function() {
					constellation.deleteLayout();
				}))
				.appendTo(_uiView);
			
			// Create line view container.
			_svg = $('<svg xmlns="http://www.w3.org/2000/svg" version="1.1"/>')[0];
			_gridView.prepend(_svg);
			
			// Remove nodes control.
			this.ui.addButton('remove', function() {
				constellation.removeGeom();
			});
			
			// Join nodes control.
			this.ui.addButton('join', function() {
				constellation.joinNodes();
			});
			
			// Split nodes control.
			this.ui.addButton('break', function() {
				constellation.splitNodes();
			});
			
			// Make polygon control.
			this.ui.addButton('polygon', function() {
				constellation.addPolygon();
			});
			
			// Pathfinder control.
			this.ui.addDivider();
			this.ui.addButton('find path', function() {
				constellation.getPath();
			});
			
			// Output message text.
			_outputView = $('<div/>')
				.attr({id:'constellation-output'})
				.hide()
				.appendTo(body);
			
			// Run all startup tasks.
			while (_startup.length) {
				(_startup.shift())();
			}
			
			// Set screen resize behavior.
			function setViewHeight() {
				body.height(win.height());
			}
			
			win.resize(setViewHeight);
			setViewHeight();
			
			// Show list of available layouts.
			this.listLayouts();
		}
	};
}());

$(document).ready(function() {
	"use strict";
	constellation.init();
	
	$('#info button').click(function(evt) {
		evt.preventDefault();
		var info = $('#info div');
		if (info.is(':visible')) {
			info.hide();
			$(this).text('info');
		} else {
			info.show();
			$(this).text('close');
		}
	});
});