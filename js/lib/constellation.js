/**
* constellation.js
* A point-based grid layout and geometry search application by Greg MacWilliam.
* Released under MIT license.
*/

// JSLint options:
/*global define, console */
/*jslint browser:true, white:true, plusplus:true, vars:true */

(function( sqrt, min, abs ) {
	"use strict";

	var root = this;
	
	// The top-level namespace.
	// All public Constellation classes and modules will be attached to this.
	// Exported for both CommonJS and the browser.
	var Const;
	if (typeof exports !== 'undefined') {
		Const = exports;
	} else {
		Const = root.Const = {};
	}
	
	// Const._c / Underscore shim
	// --------------------------
	// Based on methods of Underscore.js
	// Implementations are unique to Constellation.
	var _c = Const.utils = {
		
		// Gets all of an object's keys as an array.
		keys: function( obj ) {
			var keys = [];
			for ( var i in obj ) {
				if ( obj.hasOwnProperty(i) ) {
					keys.push( i );
				}
			}
			return keys;
		},
		
		// Removes all properties from an object.
		wipe: function( obj ) {
			for ( var i in obj ) {
				if ( obj.hasOwnProperty(i) ) {
					delete obj[ i ];
				}
			}
		},
		
		// Gets the number of items in an array, or number of properties on an object.
		size: function( obj ) {
			// Array.
			if ( obj instanceof Array ) {
				return obj.length;
			}

			// Object.
			var num = 0;
			for ( var i in obj ) {
				if ( obj.hasOwnProperty(i) ) {
					num++;
				}
			}
			return num;
		},
		
		// Runs an iterator function over each item in an array or object.
		each: function( obj, iteratorFunct, context ) {
			var i = 0;
			
			if ( obj instanceof Array ) {
				// Array.
				var len = obj.length;
				while ( i < len ) {
					iteratorFunct.call( context, obj[i], i++ );
				}

			} else {
				// Object.
				for ( i in obj ) {
					if ( obj.hasOwnProperty(i) ) {
						iteratorFunct.call( context, obj[i], i );
					}
				}
			}
		},
		
		// Tests if an array contains a value.
		contains: function( array, item ) {
			
			// Test with native indexOf method.	
			if ( typeof(Array.prototype.indexOf) === 'function' ) {
				return array.indexOf( item ) >= 0;
			}
			
			// Brute-force search method.
			var len = array.length,
				i = 0;
			
			while ( i < len ) {
				if ( array[i++] === item ) {
					return true;
				}
			}
			
			return false;
		},
		
		// Runs a test function on each item in the array,
		// then returns true if all items pass the test.
		all: function( array, testFunct, context ) {
			var len = array.length,
				i = 0;
				
			while ( i < len ) {
				if ( !testFunct.call( context, array[i], i++ ) ) {
					return false;
				}
			}
			return true;
		}
	};
	
	// Const.Point
	// -----------
	// Tests the distance between two points.
	Const.distance = function(a, b) {
		var h = b.x-a.x,
			v = b.y-a.y;
		return sqrt(h*h + v*v);
	};
	
	// Tests for intersection between line segments AB and CD.
	Const.intersect = function(a, b, c, d) {
		// Tests for counter-clockwise winding among three points.
		// Specifically written for intersection test:
		// Uses ">=" (rather than ">") to account for equal points.
		function ccw(x, y, z) {
			return (z.y-x.y) * (y.x-x.x) >= (y.y-x.y) * (z.x-x.x);
		}
		return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
	};

	// Tests if point P falls within a polygonal region; test performed by ray scan.
	// @param p: The point to test.
	// @param poly: An array of points forming a polygonal shape.
	// @return: true if point falls within polygon.
	Const.hitTestPolygon = function(p, poly) {
		var sides = poly.length,
			origin = new Const.Point(0, p.y),
			hits = 0,
			s1,
			s2,
			i;
	
		// Test intersection of an external ray against each polygon side.
		for (i = 0; i < sides; i++) {
			s1 = poly[i];
			s2 = poly[(i+1) % sides];
			origin.x = min(origin.x, min(s1.x, s2.x)-1);
			hits += (this.intersect(origin, p, s1, s2) ? 1 : 0);
		}

		// Return true if an odd number of hits were found.
		return hits % 2 > 0;
	};

	// Snaps point P to the nearest position along line segment AB.
	// @param p: The point to snap.
	// @param a: An array of points forming a polygonal shape.
	// @param b: An array of points forming a polygonal shape.
	// @return: A new point object with "x" and "y" coordinates.
	Const.snapPointToLine = function(p, a, b) {
		var ap1 = p.x-a.x,
			ap2 = p.y-a.y,
			ab1 = b.x-a.x,
			ab2 = b.y-a.y,
			mag = ab1*ab1 + ab2*ab2,
			dot = ap1*ab1 + ap2*ab2,
			t = dot/mag;

		if (t < 0) {
			return new Const.Point(a.x, a.y);
		} else if (t > 1) {
			return new Const.Point(b.x, b.y);
		}
		return new Const.Point( a.x + ab1*t, a.y + ab2*t );
	};

	// Finds the nearest point within an array of points to target P.
	// @param points: An array of points to find the nearest neighbor within.
	// @param p: The point to test.
	// @return: nearst point from list of points.
	Const.getNearestPointToPoint = function( points, p ) {
		var i = points.length-1,
			a,
			dist,
			bestPt,
			bestDist = NaN;

		// Sort points by horizontal offset from P.
		points.sort(function(a, b) {
			a = abs(p.x-a.x);
			b = abs(p.x-b.x);
			return b-a;
		});
	
		while ( i >= 0 ) {
			a = points[i--];
			if (abs(p.x-a.x) < bestDist || isNaN(bestDist)) {
				dist = Const.distance(p, a);
				if (dist < bestDist || isNaN(bestDist)) {
					bestPt = a;
					bestDist = dist;
				}
			} else {
				break;
			}
		}

		return bestPt;
	};
	
	// Const.Point
	// -----------
	Const.Point = function( x, y ) {
		this.x = x || 0;
		this.y = y || 0;
	};
	
	// Const.Node
	// ----------
	Const.Node = function( id, x, y, to ) {
		this.id = id;
		this.x = x || 0;
		this.y = y || 0;
		this.to = to || {};
	};
	
	// Const.Polygon
	// -------------
	Const.Polygon = function( id, nodes ) {
		this.id = id;
		this.nodes = nodes.slice();
		this.sides = nodes.length;
	};
	
	// Const.Grid
	// ----------
	Const.Grid = function(nodes, polys) {
		this.nodes = {};
		this.polys = {};
		this.icount = 0;
		this.setData(nodes, polys);
	};
	Const.Grid.prototype = {
		
		// Defines event names used by the library.
		events: {
			ADD: 'add',
			REMOVE: 'remove',
			CHANGE: 'change'
		},

		// Defines keys for geometry item types.
		types: {
			NODE: 'n',
			POLYGON: 'p'
		},
		
		// Clears all existing node and polygon references from the grid.
		reset: function() {
			_c.wipe( this.nodes );
			_c.wipe( this.polys );
			this.icount = 0;
		},
		
		// Sets new data to the grid.
		setData: function( nodes, polys ) {
			this.reset();

			_c.each( nodes || [], function( node ) {
				this.nodes[ node.id ] = node;
			}, this);
			
			_c.each( polys || [], function( poly ) {
				this.polys[ poly.id ] = poly;
			}, this);
		},
		
		// Adds a new node to the grid at the specified X and Y coordinates.
		addNode: function( x, y, silent ) {
			var node = new Const.Node( this.types.NODE+ this.icount++, x, y );
			this.nodes[ node.id ] = node;
			this.update(true, silent);
			return node.id;
		},
		
		// Gets a single node by id reference.
		getNodeById: function( id ) {
			if ( this.nodes.hasOwnProperty(id) ) {
				return this.nodes[id];
			}
			return null;
		},
		
		// Counts the number of nodes defined within the grid.
		getNumNodes: function() {
			return _c.size( this.nodes );
		},
		
		// Tests if a collection of node ids are all defined.
		hasNodes: function( group ) {
			return _c.all(group, function(id) {
				return this.nodes.hasOwnProperty( id );
			}, this);
		},
		
		// Joins nodes within a selection group.
		// Selection group may be an array of node ids, or an object of id keys.
		joinNodes: function( group, silent ) {
			var change = false;
			
			// Group must contain two or more nodes to join...
			if ( group.length > 1 && this.hasNodes(group) ) {
				
				// Loop through selection group of nodes...
				_c.each(group, function(id) {
					var node = this.nodes[id],
						len = group.length,
						i = 0;
						
					while ( i < len ) {
						id = group[i++];
						if (id !== node.id) {
							node.to[ id ] = 1;
							change = true;
						}
					}
				}, this);
			}
			
			this.update(change, silent);
			return change;
		},
		
		// Splits apart nodes within a selection group.
		// Selection group may be an array of node ids, or an object of id keys.
		splitNodes: function( group, silent ) {
			var change = false;
			
			// Alias 'detach' method for a single node reference.
			if (group.length < 2) {
				this.detachNodes( group );
				return;
			}

			// Decouple group node references.
			_c.each(group, function(id) {
				var node = this.nodes[id];
				
				if (node && node.to) {
					for ( id in node.to ) {
						if ( _c.contains(group, id) ) {
							delete node.to[ id ];
							change = true;
						}
					}
				}
			}, this);

			this.update(change, silent);
			return change;
		},
		
		// Detachs a node from the grid.
		// Each node's connections will be severed from all joining nodes.
		detachNodes: function( group, silent ) {
			var change = false;
			
			_c.each(group, function(id) {
				var local = this.nodes[id],
					foreign,
					i;
				
				if ( local && local.to ) {
					// Break all connections between target and its neighbors.
					for ( i in local.to ) {
						// Delete local reference.
						delete local.to[i];
					
						// Find foreign node.
						foreign = this.nodes[i];
					
						// Delete foreign key relationship.
						if ( foreign && foreign.to ) {
							delete foreign.to[ id ];
						}
					}
					change = true;
				}
			}, this);
			
			this.update(change, silent);
			return change;
		},
		
		// Detaches and removes a collection of nodes from the grid.
		removeNodes: function( group, silent ) {
			// detach all nodes from the grid without triggering an update.
			var change = this.detachNodes( group, true );

			_c.each(group, function(id) {
				var poly,
					i;
					
				if ( this.nodes.hasOwnProperty(id) ) {
					// Detach and remove the node.
					delete this.nodes[id];
					
					// Remove any dependent polygons.
					for (i in this.polys) {
						poly = this.polys[i];

						if ( poly && _c.contains( poly.nodes, id ) ) {
							delete this.polys[i];
						}
					}
					change = true;
				}
			}, this);
			
			this.update(change, silent);
			return change;
		},
		
		// Adds a polygon to the grid, formed by a collection of node ids.
		addPolygon: function( group, silent ) {
			var poly;
			
			if ( group.length >= 3 && this.hasNodes(group) ) {
				poly = new Const.Polygon( this.types.POLYGON+ this.icount++, group );
				this.polys[ poly.id ] = poly;
				this.update(true, silent);
				return poly.id;
			}
			return null;
		},
		
		// Gets a polygon model by id reference.
		getPolygonById: function( id ) {
			if ( this.polys.hasOwnProperty(id) ) {
				return this.polys[ id ];
			}
			return null;
		},
		
		// Counts the number of polygons defined in the grid.
		getNumPolygons: function() {
			return _c.size( this.polys );
		},
		
		// Removes a collection of polygons from the grid.
		removePolygons: function( group, silent ) {
			var change = false;
			
			_c.each(group, function(id) {
				if ( this.polys.hasOwnProperty(id) ) {
					delete this.polys[ id ];
					change = true;
				}
			}, this);
			
			this.update(change, silent);
			return change;
		},
		
		// Triggers update event for view refresh.
		update: function( change, silent ) {
			if ( (change || change === undefined) && !silent ) {
				this.trigger( this.events.CHANGE );
			}
		},

		// Finds the shortest path between two nodes among the grid of nodes.
		// @param start: The node id within the seach grid to start at.
		// @param goal: The node id within the search grid to reach via shortest path.
		// @attr this.nodes: The grid of nodes to search, formatted as:
		/* {
			n1: {id:"n1", x:25, y:25, to:{n2:true, n3:true}},
			n2: {id:"n2", x:110, y:110, to:{n1:true}},
			n3: {id:"n3", x:50, y:180, to:{n1:true}},
		};*/
		// @return: A report on the search, including:
		//  @attr length: length of completed path.
		//  @attr cycles: number of cycles required to complete the search.
		//  @attr nodes: an array of path nodes, formatted as [startNode, ...connections, goalNode].
		findPath: function( start, goal ) {
			
			function Path(nodes, length, estimate) {
				this.nodes = (nodes || []);
				this.length = (length || 0);
				this.estimate = (estimate || 0);
			}
			Path.prototype = {
				copy: function(length, estimate) {
					return new Path(this.nodes.slice(), (length || this.length), (estimate || this.estimate));
				},
				last: function() {
					return this.nodes[ this.nodes.length-1 ];
				},
				contains: function(node) {
					return _c.contains(node);
				},
				prioratize: function(a, b) {
					return b.estimate - a.estimate;
				},
				dispose: function() {
					this.nodes.length = 0;
					this.nodes = null;
				}
			};
			
			var queue = [], // Queue of paths to search, sorted by estimated length (longest to shortest).
				distances = {}, // Table of shortest distances found to each node id.
				bestPath, // The best completed path found to goal.
				searchPath, // A current path to be extended and searched.
				searchNode, // A current node to extend outward and searched from.
				branchPath, // A new path branch for the search queue.
				branchLength, // Actual length of a new branch being explored.
				branchEstimate, // Estimated best-case length of new branch reaching goal.
				startNode = this.getNodeById( start ),
				goalNode = this.getNodeById( goal ),
				cycles = 0,
				i;

			queue.push( new Path([startNode]) );

			// While the queue contains paths:
			while (queue.length > 0) {
				searchPath = queue.pop();
				startNode = searchPath.last();

				// Extend search path outward to the next set of connections, creating X new paths.
				for (i in startNode.to) {
					if (startNode.to.hasOwnProperty(i)) {
						searchNode = this.nodes[ i ];

						// Reject loops.
						if (!!searchNode && !searchPath.contains( searchNode )) {
							branchLength = searchPath.length + Const.distance( startNode, searchNode );

							// Test branch fitness.
							if (branchLength <= (distances[searchNode.id] || branchLength)) {
								distances[searchNode.id] = branchLength;
								branchEstimate = branchLength + Const.distance( searchNode, goalNode );

								// Test for viable path to goal.
								if (!bestPath || branchEstimate < bestPath.length) {

									// Create a new branch path extended to search node.
									branchPath = searchPath.copy(branchLength, branchEstimate);
									branchPath.nodes.push( searchNode );

									// Test if goal has been reached.
									if (searchNode.id === goalNode.id) {
										if (bestPath) {
											// Dispose of any existing completed path.
											bestPath.dispose();
										}
										bestPath = branchPath; // Retain best completed path.
									} else {
										queue.push( branchPath ); // Queue additional search path.
									}

									branchPath = null;
								}
							}
						}

						searchNode = null;
					}
				}

				// Dispose of search path.
				searchPath.dispose();
				searchPath = startNode = null;

				// Sort queue by estimate length, longest to shortest.
				queue.sort(Path.prototype.prioratize);

				// Count search cycle.
				cycles++;
			}

			// Cleanup local references.
			queue = distances = goalNode = null;

			// Return best discovered path.
			return {
				valid: !!bestPath,
				length: (bestPath ? bestPath.length : 0),
				cycles: cycles,
				nodes: (bestPath ? bestPath.nodes : [])
			};
		},
		
		// Snaps the provided point to the nearest position within the node grid.
		// @param pt  The point to snap into the grid.
		// @return  A new point with the snapped position, or the original point if no grid was searched.
		snapPointToGrid: function( pt ) {
			var a,
				b,
				snapped,
				offset,
				bestPoint = null,
				bestDistance = NaN,
				tested = {},
				i,
				j;

			// Loop through all grid nodes.
			for ( i in this.nodes ) {
				if ( this.nodes.hasOwnProperty(i) && pt.id !== i ) {
					a = this.nodes[i];

					// Loop through each node's connections.
					for (j in a.to) {
						if (a.to.hasOwnProperty(j) && !tested.hasOwnProperty(j+' '+a.id)) {
							b = this.nodes[j];
							snapped = Const.snapPointToLine(pt, a, b);
							offset = Const.distance(pt, snapped);
							tested[a.id+' '+b.id] = true;

							if (!bestPoint || offset < bestDistance) {
								bestPoint = snapped;
								bestDistance = offset;
							}
						}
					}

				}
			}

			return bestPoint || pt;
		},
		
		// Finds the nearest node to a specified point within the grid.
		// @param pt  The point to snap into the grid.
		// @return  A new point with the snapped position, or the original point if no grid was searched.
		getNearestNodeToPoint: function( pt ) {
			var nodes = [],
				omit = pt.id || '',
				i;
				
			for ( i in this.nodes ) {
				if ( this.nodes.hasOwnProperty(i) && i !== omit ) {
					nodes.push( this.nodes[i] );
				}
			}
			
			pt = Const.getNearestPointToPoint( nodes, pt );
			nodes.length = 0;
			return pt;
		}
	};
	
	// Const.Grid events
	// -----------------
	// Uses the Backbone.js implementation:
	// (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
	// Backbone may be freely distributed under the MIT license.
	(function( obj, _ ) {
		
		// Regular expression used to split event strings
		var eventSplitter = /\s+/;
		
		// Bind one or more space separated events, `events`, to a `callback`
	    // function. Passing `"all"` will bind the callback to all events fired.
	    obj.on = obj.bind = function (events, callback, context) {
	        var calls, event, list;
	        if (!callback) return this;

	        events = events.split(eventSplitter);
	        calls = this._callbacks || (this._callbacks = {});

	        while (event = events.shift()) {
	            list = calls[event] || (calls[event] = []);
	            list.push(callback, context);
	        }

	        return this;
	    };

	    // Remove one or many callbacks. If `context` is null, removes all callbacks
	    // with that function. If `callback` is null, removes all callbacks for the
	    // event. If `events` is null, removes all bound callbacks for all events.
	    obj.off = obj.unbind = function (events, callback, context) {
	        var event, calls, list, i;

	        // No events, or removing *all* events.
	        if (!(calls = this._callbacks)) return this;
	        if (!(events || callback || context)) {
	            delete this._callbacks;
	            return this;
	        }

	        events = events ? events.split(eventSplitter) : _.keys(calls);

	        // Loop through the callback list, splicing where appropriate.
	        while (event = events.shift()) {
	            if (!(list = calls[event]) || !(callback || context)) {
	                delete calls[event];
	                continue;
	            }

	            for (i = list.length - 2; i >= 0; i -= 2) {
	                if (!(callback && list[i] !== callback || context && list[i + 1] !== context)) {
	                    list.splice(i, 2);
	                }
	            }
	        }

	        return this;
	    };

	    // Trigger one or many events, firing all bound callbacks. Callbacks are
	    // passed the same arguments as `trigger` is, apart from the event name
	    // (unless you're listening on `"all"`, which will cause your callback to
	    // receive the true name of the event as the first argument).
	    obj.trigger = obj.emit = function (events) {
	        var event, calls, list, i, length, args, all, rest;
	        if (!(calls = this._callbacks)) return this;

	        rest = [];
	        events = events.split(eventSplitter);

	        // Fill up `rest` with the callback arguments.  Since we're only copying
	        // the tail of `arguments`, a loop is much faster than Array#slice.
	        for (i = 1, length = arguments.length; i < length; i++) {
	            rest[i - 1] = arguments[i];
	        }

	        // For each event, walk through the list of callbacks twice, first to
	        // trigger the event, then to trigger any `"all"` callbacks.
	        while (event = events.shift()) {
	            // Copy callback lists to prevent modification.
	            if (all = calls.all) all = all.slice();
	            if (list = calls[event]) list = list.slice();

	            // Execute event callbacks.
	            if (list) {
	                for (i = 0, length = list.length; i < length; i += 2) {
	                    list[i].apply(list[i + 1] || this, rest);
	                }
	            }

	            // Execute "all" callbacks.
	            if (all) {
	                args = [event].concat(rest);
	                for (i = 0, length = all.length; i < length; i += 2) {
	                    all[i].apply(all[i + 1] || this, args);
	                }
	            }
	        }

	        return this;
	    };
	
	}( Const.Grid.prototype, Const.utils ));
	
	
	// AMD
	// ---
	// Define Constellation as an AMD module if environment is configured.
	if (typeof(define) === 'function' && typeof(define.amd) === 'object') {
		define(Const);
	}
	
}).call( this, Math.sqrt, Math.min, Math.abs );