// Constellation.js 0.2.0

// (c) 2011-2013 Greg MacWilliam
// Constellation may be freely distributed under the MIT license
// Docs: https://github.com/gmac/constellation.js

(function(context, factory) {
	
	var C = factory(Math.sqrt, Math.min, Math.max, Math.abs);
	
	if (typeof exports !== "undefined") module.exports = C;
	else if (typeof define === "function" && define.amd) define(C);
	else context.Const = C;

}(this, function(sqrt, min, max, abs) {

	// Top-level namespace:
	// all public Constellation classes and modules will attach to this.
	var Const = {};

	// Type-assessment & argument utils:
	function isArray(obj) {
		return obj instanceof Array;
	}
	
	function isFunction(obj) {
		return typeof obj === 'function';
	}
	
	function getArgsArray(args) {
		return Array.prototype.slice.call(args);
	}
	
	function isSameSegment(a, b, c, d) {
		return (a === c && b === d) || (a === d && b === c);
	}
	
	function mapIds(list, rewrite) {
		if (!rewrite) list = list.slice();
		
		for (var i=0, len=list.length; i < len; i++) {
			var id = list[i].id;
			if (id) list[i] = id;
		}
		return list;
	}
	
	// Const._c / Underscore shim
	// --------------------------
	// Based on methods of Underscore.js
	// Implementations are unique to Constellation.
	var _c = Const.utils = {
		
		// Gets the number of items in an array, or number of properties on an object.
		size: function(obj) {
			// Array.
			if (isArray(obj)) {
				return obj.length;
			}

			// Object.
			var num = 0;
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) num++;
			}
			return num;
		},
		
		// Tests if an array contains a value.
		contains: function(obj, item) {
			if (isArray(obj)) {
				
				// Test with native indexOf method.	
				if (isFunction(Array.prototype.indexOf)) {
					return obj.indexOf(item) >= 0;
				}
			
				// Brute-force search method.
				var len = obj.length;
				var i = 0;
			
				while (i < len) {
					if (obj[i++] === item) return true;
				}
			}
			
			return obj && obj.hasOwnProperty(item);
		},
		
		// Runs an iterator function over each item in an array or object.
		each: function(obj, iteratorFunct, context) {
			var i = 0;
			
			if (isArray(obj)) {
				// Array.
				var len = obj.length;
				while (i < len) {
					iteratorFunct.call(context, obj[i], i++);
				}

			} else {
				// Object.
				for (i in obj) {
					if (obj.hasOwnProperty(i)) {
						iteratorFunct.call(context, obj[i], i);
					}
				}
			}
			return obj;
		},
		
		// Runs a mutator function over each item in an array or object, setting the result as the new value.
		map: function(obj, mutatorFunct, context) {
			var i = 0;
			
			if (isArray(obj)) {
				// Array.
				var len = obj.length;
				while (i < len) {
					obj[i] = mutatorFunct.call(context, obj[i], i++);
				}

			} else {
				// Object.
				for (i in obj) {
					if (obj.hasOwnProperty(i)) {
						obj[i] = mutatorFunct.call(context, obj[i], i);
					}
				}
			}
			return obj;
		},
		
		// Runs a test function on each item in the array,
		// then returns true if all items pass the test.
		all: function(array, testFunct, context) {
			var len = array.length;
			var i = 0;
			
			while (i < len) {
				if (!testFunct.call(context, array[i], i++)) {
					return false;
				}
			}
			return true;
		},
		
		// Formats a collection of object values into an array.
		toArray: function(obj) {
			var array = [];
			
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) array.push(obj[i]);
			}
			return array;
		}
	};
	
	// Const.Point
	// -----------
	var Point = Const.Point = function(x, y, z) {
		this.x = x || 0;
		this.y = y || 0;
	};
	
	// Const.Rect
	// ----------
	var Rect = Const.Rect = function(x, y, w, h) {
		this.x = x || 0;
		this.y = y || 0;
		this.width = w || 0;
		this.height = h || 0;
	};
	
	// Const Geom Methods
	// ------------------
	// Tests the distance between two points.
	Const.distance = function(a, b) {
		var x = b.x-a.x;
		var y = b.y-a.y;
		return sqrt(x*x + y*y);
	};
	
	// Tests for counter-clockwise winding among three points.
	// @param x: Point X of triangle XYZ.
	// @param y: Point Y of triangle XYZ.
	// @param z: Point Z of triangle XYZ.
	// @param exclusive boolean: when true, equal points will be excluded from the test.
	Const.ccw = function(x, y, z, exclusive) {
		return exclusive ?
		 	(z.y-x.y) * (y.x-x.x) > (y.y-x.y) * (z.x-x.x) :
			(z.y-x.y) * (y.x-x.x) >= (y.y-x.y) * (z.x-x.x);
	};
	
	// Tests for intersection between line segments AB and CD.
	// @param a: Point A of line AB.
	// @param b: Point B of line AB.
	// @param c: Point C of line CD.
	// @param d: Point D of line CD.
	// @return: true if AB intersects CD.
	Const.intersect = function(a, b, c, d) {
		return Const.ccw(a, c, d) !== Const.ccw(b, c, d) && Const.ccw(a, b, c) !== Const.ccw(a, b, d);
	};
	
	// Convert degrees to radians.
	// @param degrees value.
	// @return radians equivalent.
	Const.degreesToRadians = function(degrees) {
		return degrees * Math.PI / 180;
	};
	
	// Convert radians to degrees.
	// @param radians value.
	// @return degrees equivalent.
	Const.radiansToDegrees = function(radians) {
		return radians * 180 / Math.PI;
	};
	
	// Calculates the angle (in radians) between line segment AB and the positive X-origin.
	// @param a: Point A of line AB.
	// @param b: Point B of line AB.
	// @return angle (in radians).
	Const.angleRadians = function(a, b) {
		return Math.atan2(b.y-a.y, b.x-a.x);
	};
	
	// Calculates the angle (in degrees) between line segment AB and the positive X-origin.
	// Degree value is adjusted to fall within a 0-360 range.
	// @param a: Point A of line AB.
	// @param b: Point B of line AB.
	// @return: angle degrees (0-360 range)
	Const.angleDegrees = function(a, b) {
		var degrees = Const.radiansToDegrees(Const.angleRadians(a, b));
		return degrees < 0 ? degrees+360 : degrees;
	};
	
	// Gets the index of the circle sector that an angle falls into.
	// This is useful for applying view states to a graphic while moving it around the grid.
	// Ex: create 8 walk cycles
	// @param radians: angle radians to test.
	// @param sectors: number of sectors to divide the circle into. Default is 8.
	// @param offset: offsets the origin of the sector divides within the circle. Default is PI*2/16.
	// @return sector index (a number between 0 and X-1, where X is number of sectors).
	Const.angleSector = function(radians, sectors, offset) {
		var circ = Math.PI * 2;
		sectors = sectors || 8;
		offset = offset || circ / (sectors * 2);
		if (radians < 0) radians = circ + radians;
		radians += offset;
		if (radians > circ) radians -= circ;
		return Math.floor(radians / (circ / sectors));
	};
	
	// Gets the rectangular bounds of a point ring.
	// @param points: The ring of points to measure bounding on.
	// @return: a new Rect object of the ring's maximum extent.
	Const.getRectForPointRing = function(points) {
		var first = points[0];
		var minX = first.x;
		var maxX = first.x;
		var minY = first.y;
		var maxY = first.y;
		
		_c.each(points, function(pt) {
			minX = min(minX, pt.x);
			maxX = max(maxX, pt.x);
			minY = min(minY, pt.y);
			maxY = max(maxY, pt.y);
		});
		
		return new Rect(minX, minY, maxX-minX, maxY-minY);
	};
	
	// Tests if point P falls within a rectangle.
	// @param p: The point to test.
	// @param rect: The Rect object to test against.
	// @return: true if point falls within rectangle.
	Const.hitTestRect = function(p, rect) {
		var minX = min(rect.x, rect.x + rect.width);
		var maxX = max(rect.x, rect.x + rect.width);
		var minY = min(rect.y, rect.y + rect.height);
		var maxY = max(rect.y, rect.y + rect.height);
		
		return p.x >= minX && p.y >= minY && p.x <= maxX && p.y <= maxY;
	};
	
	// Tests if point P falls within a polygonal region; test performed by ray casting.
	// @param p: The point to test.
	// @param points: An array of points forming a polygonal shape.
	// @return: true if point falls within point ring.
	Const.hitTestPointRing = function(p, points) {
		var origin = new Point(0, p.y);
		var hits = 0;
	
		// Test intersection of an external ray against each polygon side.
		for (var i=0, sides=points.length; i < sides; i++) {
			var s1 = points[i];
			var s2 = points[(i+1) % sides];
			origin.x = min(origin.x, min(s1.x, s2.x)-1);
			hits += (this.intersect(origin, p, s1, s2) ? 1 : 0);
		}
		
		// Return true if an odd number of hits were found.
		return hits % 2 > 0;
	};

	// Snaps point P to the nearest position along line segment AB.
	// @param p: Point P to snap to line segment AB.
	// @param a: Point A of line segment AB.
	// @param b: Point B of line segment AB.
	// @return: new Point object with snapped coordinates.
	Const.snapPointToLineSegment = function(p, a, b) {
		var ap1 = p.x-a.x;
		var ap2 = p.y-a.y;
		var ab1 = b.x-a.x;
		var ab2 = b.y-a.y;
		var mag = ab1*ab1 + ab2*ab2;
		var dot = ap1*ab1 + ap2*ab2;
		var t = dot/mag;

		if (t < 0) {
			return new Point(a.x, a.y);
		} else if (t > 1) {
			return new Point(b.x, b.y);
		}
		return new Point(a.x + ab1*t, a.y + ab2*t);
	};

	// Finds the nearest point within an array of points to target P.
	// @param p: Point P to test against.
	// @param points: Array of Points to find the nearest point within.
	// @return: nearest Point to P, or null if no points were available.
	Const.getNearestPointToPoint = function(p, points) {
		var bestPt = null;
		var bestDist = Infinity;
		var i = points.length-1;
		var a, dist;

		// Sort points by horizontal offset from P.
		points.sort(function(a, b) {
			a = abs(p.x-a.x);
			b = abs(p.x-b.x);
			return b-a;
		});
	
		while (i >= 0) {
			a = points[i--];
			if (abs(p.x-a.x) < bestDist) {
				dist = Const.distance(p, a);
				if (dist < bestDist) {
					bestPt = a;
					bestDist = dist;
				}
			} else {
				break;
			}
		}

		return bestPt;
	};
	
	// Const.Node
	// ----------
	var Node = Const.Node = function(id, x, y, data, to) {
		this.id = id;
		this.x = x || 0;
		this.y = y || 0;
		this.to = to || {};
		this.data = data || null;
	};
	
	Node.prototype = {
		toPoint: function() {
			return {
				x: this.x,
				y: this.y,
				data: this.data || null
			};
		}
	};
	
	// Const.Polygon
	// -------------
	var Polygon = Const.Polygon = function(id, nodes, data) {
		this.id = id;
		this.nodes = nodes.slice();
		this.data = data || null;
	};
	
	// Const.Path
	// ----------
	var Path = Const.Path = function(nodes, weight, estimate) {
		this.nodes = (nodes || []);
		this.weight = (weight || 0);
		this.estimate = (estimate || 0);
	};
	
	Path.prototype = {
		copy: function(weight, estimate) {
			return new Path(this.nodes.slice(), (weight || this.weight), (estimate || this.estimate));
		},
		last: function() {
			return this.nodes[ this.nodes.length-1 ];
		},
		contains: function(node) {
			return _c.contains(node);
		},
		prioratize: function(a, b) {
			return b.estimate - a.estimate;
		}
	};
	
	// Const.Grid
	// ----------
	var Grid = Const.Grid = function(data) {
		this.reset(data);
	};
	
	Grid.prototype = {
		nodes: {},
		polys: {},
		_i: 0,
		
		// Creates a raw data representation of the grid:
		toJSON: function() {
			return {
				nodes: this.nodes,
				polys: this.polys,
				i: this._i
			};
		},
		
		// Clears all existing node and polygon references from the grid.
		reset: function(data) {
			this.nodes = {};
			this.polys = {};
			this._i = 0;
			
			if (data) {
				this._i = data.i || 0;
				
				_c.each(data.nodes || {}, function(node) {
					this.nodes[ node.id ] = node;
				}, this);
				
				_c.each(data.polys || {}, function(poly) {
					this.polys[ poly.id ] = poly;
				}, this);
			}
		},
		
		// Adds a new node to the grid at the specified X and Y coordinates.
		addNode: function(x, y, data) {
			if (typeof x === 'object') {
				data = x;
				x = 0;
			}
			var node = new Node((data && data.id) || ('n'+ this._i++), x, y, data);
			this.nodes[ node.id ] = node;
			return node;
		},
		
		// Gets a node by id reference.
		getNodeById: function(id) {
			return this.nodes.hasOwnProperty(id) ? this.nodes[id] : null;
		},
		
		// Gets a collection of nodes by id references.
		getNodes: function(ids, rest) {
			if (!isArray(ids) || rest) {
				ids = getArgsArray(arguments);
			}
			
			return _c.map(ids.slice(), function(id) {
				return this.getNodeById(id);
			}, this);
		},
		
		// Counts the number of nodes defined within the grid.
		getNumNodes: function() {
			return _c.size(this.nodes);
		},
		
		// Tests if a node id or array of node ids are defined.
		hasNodes: function(ids, rest) {
			if (!isArray(ids) || rest) {
				ids = getArgsArray(arguments);
			}
			
			return _c.all(ids, function(id) {
				return this.nodes.hasOwnProperty(id);
			}, this);
		},

		// Joins nodes within a selection group.
		// Selection group may be an array of node ids, or an object of id keys.
		joinNodes: function(ids, rest) {
			if (!isArray(ids) || rest) {
				ids = getArgsArray(arguments);
			}
			
			var change = false;
			
			// Group must contain two or more nodes to join...
			if (ids.length > 1 && this.hasNodes(ids)) {

				// Loop through selection group of nodes...
				_c.each(ids, function(id) {
					var node = this.nodes[id];
					var len = ids.length;
					var j = 0;
						
					while (j < len) {
						id = ids[j++];
						if (id !== node.id) {
							node.to[id] = 1;
							change = true;
						}
					}
				}, this);
			}
			
			return change;
		},
		
		// Splits apart nodes within a selection group.
		// Selection group may be an array of node ids, or an object of id keys.
		splitNodes: function(ids, rest) {
			if (!isArray(ids) || rest) {
				ids = getArgsArray(arguments);
			}
			
			// Alias 'detach' method for a single node reference.
			if (ids.length < 2) {
				return this.detachNodes(ids);
			}
			
			var change = false;
			
			// Decouple group node references.
			_c.each(ids, function(id) {
				var node = this.nodes[id];
				
				if (node && node.to) {
					for (id in node.to) {
						if (_c.contains(ids, id)) {
							delete node.to[id];
							change = true;
						}
					}
				}
			}, this);
			
			return change;
		},
		
		// Detachs a node from the grid.
		// Each node's connections will be severed from all joining nodes.
		detachNodes: function(ids, rest) {
			if (!isArray(ids) || rest) {
				ids = getArgsArray(arguments);
			}
			
			var change = false;
			
			_c.each(ids, function(id) {
				var local = this.nodes[id];
				var foreign, j;
				
				if (local && local.to) {
					// Break all connections between target and its neighbors.
					for (j in local.to) {
						// Delete local reference.
						delete local.to[j];
					
						// Find foreign node.
						foreign = this.nodes[j];
					
						// Delete foreign key relationship.
						if (foreign && foreign.to) {
							delete foreign.to[id];
						}
					}
					change = true;
				}
			}, this);
			
			return change;
		},
		
		// Detaches and removes a collection of nodes from the grid.
		removeNodes: function(ids, rest) {
			if (!isArray(ids) || rest) {
				ids = getArgsArray(arguments);
			}
			
			var change = this.detachNodes(ids);

			_c.each(ids, function(id) {
				var poly, j;
					
				if (this.nodes.hasOwnProperty(id)) {
					// Detach and remove the node.
					delete this.nodes[id];
					
					// Remove any dependent polygons.
					for (j in this.polys) {
						poly = this.polys[j];

						if (poly && _c.contains(poly.nodes, id)) {
							delete this.polys[j];
						}
					}
					change = true;
				}
			}, this);

			return change;
		},
		
		// Adds a polygon to the grid, formed by a collection of node ids.
		addPolygon: function(nodes, data) {
			if (nodes.length >= 3 && this.hasNodes(nodes)) {
				var poly = new Polygon(('p'+ this._i++), nodes, data);
				this.polys[ poly.id ] = poly;
				return poly;
			}
			return null;
		},
		
		// Gets a polygon by id reference.
		getPolygonById: function(id) {
			return this.polys.hasOwnProperty(id) ? this.polys[id] : null;
		},
		
		// Gets a collection of polygons by id references.
		getPolygons: function(ids, rest) {
			if (!isArray(ids) || rest) {
				ids = getArgsArray(arguments);
			}
			
			return _c.map(ids.slice(), this.getPolygonById, this);
		},
		
		// Gets an array of nodes representing a polygon in the grid.
		getNodesForPolygon: function(id) {
			if (this.polys.hasOwnProperty(id)) {
				return _c.map(this.polys[id].nodes.slice(), this.getNodeById, this);
			}
			return null;
		},
		
		// Counts the number of polygons defined in the grid.
		getNumPolygons: function() {
			return _c.size(this.polys);
		},
		
		// Removes a collection of polygons from the grid.
		removePolygons: function(ids, rest) {
			if (!isArray(ids) || rest) {
				ids = getArgsArray(arguments);
			}
			
			var change = false;

			_c.each(ids, function(id) {
				if (this.polys.hasOwnProperty(id)) {
					delete this.polys[id];
					change = true;
				}
			}, this);
			
			return change;
		},

		// Finds the shortest path between two nodes among the grid of nodes.
		// @param start: The node id within the seach grid to start at.
		// @param goal: The node id within the search grid to reach via shortest path.
		// @attr this.nodes: The grid of nodes to search, formatted as:
		/* {
			n1: {id:"n1", x:25, y:25, to:{n2:1, n3:1}},
			n2: {id:"n2", x:110, y:110, to:{n1:1}},
			n3: {id:"n3", x:50, y:180, to:{n1:1}},
		};*/
		// @return: A report on the search, including:
		//  @attr length: length of completed path.
		//  @attr cycles: number of cycles required to complete the search.
		//  @attr nodes: an array of path nodes, formatted as [startNode, ...connections, goalNode].
		findPath: function(start, goal, weightFunction, estimateFunction) {
			
			var queue = []; // Queue of paths to search, sorted by estimated weight (highest to lowest).
			var weights = {}; // Table of shortest weights found to each node id.
			var bestPath; // The best completed path found to goal.
			var searchPath; // A current path to be extended and searched.
			var searchNode; // A current node to extend outward and searched from.
			var branchPath; // A new path branch for the search queue.
			var branchWeight; // Current weight of a new branch being explored.
			var branchEstimate; // Estimated best-case weight of new branch reaching goal.
			var startNode = this.getNodeById(start);
			var goalNode = this.getNodeById(goal);
			var cycles = 0;
			var i;
			
			// Default weight and estimate functions to use distance calculation.
			if (!isFunction(weightFunction)) weightFunction = Const.distance;
			if (!isFunction(estimateFunction)) estimateFunction = Const.distance;

			// Create initial search path with default weight from/to self.
			queue.push(new Path([startNode], weightFunction(startNode, startNode)));

			// While the queue contains paths:
			while (queue.length > 0) {
				searchPath = queue.pop();
				startNode = searchPath.last();

				// Extend search path outward to the next set of connections, creating X new paths.
				for (i in startNode.to) {
					if (startNode.to.hasOwnProperty(i)) {
						searchNode = this.nodes[ i ];

						// Reject loops.
						if (!!searchNode && !searchPath.contains(searchNode)) {
							branchWeight = searchPath.weight + weightFunction(startNode, searchNode);

							// Test branch fitness.
							if (branchWeight <= (weights[searchNode.id] || branchWeight)) {
								weights[searchNode.id] = branchWeight;
								branchEstimate = branchWeight + estimateFunction(searchNode, goalNode);

								// Test for viable path to goal.
								if (!bestPath || branchEstimate < bestPath.weight) {

									// Create a new branch path extended to search node.
									branchPath = searchPath.copy(branchWeight, branchEstimate);
									branchPath.nodes.push(searchNode);

									// Test if goal has been reached.
									if (searchNode.id === goalNode.id) {
										bestPath = branchPath; // Retain best completed path.
									} else {
										queue.push(branchPath); // Queue additional search path.
									}
								}
								
							}
						}
					}
					
				}
				
				// Sort queue by estimate to complete, highest to lowest.
				queue.sort(Path.prototype.prioratize);

				// Count search cycle.
				cycles++;
			}
			
			// Return best discovered path.
			return {
				cycles: cycles,
				valid: !!bestPath,
				nodes: (bestPath ? bestPath.nodes : []),
				weight: (bestPath ? bestPath.weight : 0)
			};
		},
		
		// Finds a path between two points with the fewest number of connections.
		findPathWithFewestNodes: function(start, goal) {
			var step = function() { return 1; };
			return this.findPath(start, goal, step, step);
		},
		
		// Snaps the provided point to the nearest position within the node grid.
		// @param pt  The point to snap into the grid.
		// @param meta  Specify true to return full meta data on the snapped point/segment.
		// @return  A new point with the snapped position, or the original point if no grid was searched.
		snapPointToGrid: function(pt) {
			var bestPoint = null;
			var bestDistance = Infinity;
			var bestSegment = [];
			var tested = {};

			_c.each(this.nodes, function(local, id) {
				if (pt.id === id) return;

				// Loop through each node's connections.
				for (var i in local.to) {
					if (local.to.hasOwnProperty(i) && !tested.hasOwnProperty(i+' '+local.id)) {
						var foreign = this.nodes[i];
						var snapped = Const.snapPointToLineSegment(pt, local, foreign);
						var offset = Const.distance(pt, snapped);
						tested[local.id+' '+foreign.id] = true;

						if (!bestPoint || offset < bestDistance) {
							bestPoint = snapped;
							bestDistance = offset;
							bestSegment[0] = local.id;
							bestSegment[1] = foreign.id;
						}
					}
				}
			}, this);
			
			return {
			  offset: isFinite(bestDistance) ? bestDistance : 0,
				point: bestPoint || pt,
				segment: bestSegment
			};
		},
		
		snapPoint: function(pt) {
			var snapped = this.snapPointToGrid(pt);
			return snapped.point || pt;
		},
		
		// Finds the nearest node to the specified node.
		// @param origin: The origin node to search from.
		// @return: The nearest other grid node to the specified target.
		getNearestNodeToNode: function(id) {
			var nodes = [];
			var target = this.getNodeById(id);
			
			if (target) {
				_c.each(this.nodes, function(node) {
					if (node.id !== target.id) {
						nodes.push(node);
					}
				}, this);

				return Const.getNearestPointToPoint(target, nodes);
			}
			return null;
		},
		
		// Finds the nearest node to a specified point within the grid.
		// @param pt: Point to test.
		// @return: Nearest Node to target Point.
		getNearestNodeToPoint: function(pt) {
			return Const.getNearestPointToPoint(pt, _c.toArray(this.nodes));
		},
		
		// Tests if a Point intersects any Polygon in the grid.
		// @param pt: Point to test.
		// @return: True if the point intersects any polygon.
		hitTestPointInPolygons: function(pt) {
			return !!this.getPolygonsOverPoint(pt).length;
		},
		
		// Tests a Point for intersections with all Polygons in the grid, and returns their ids.
		// @param pt  The point to snap into the grid.
		// @return  Array of Polygon ids that hit the specified Point.
		getPolygonsOverPoint: function(pt) {
			var hits = [];
			for (var id in this.polys) {
				if (this.polys.hasOwnProperty(id) && Const.hitTestPointRing(pt, this.getNodesForPolygon(id))) {
					hits.push(id);
				}
			}
			return hits;
		},
		
		// Tests a Polygon for intersections with all nodes in the grid, and returns their ids.
		// @param id  The polygon id to test.
		// @return  Array of node ids that fall within the specified Polygon.
		getNodesInPolygon: function(id) {
			var hits = [];
			var poly = this.getPolygonById(id);
			var points = this.getNodesForPolygon(id);
			var rect = Const.getRectForPointRing(points);

			if (poly) {
				_c.each(this.nodes, function(node) {
					// Run incrementally costly tests:
					// - node in shape?
					// - OR...
					// node in rect AND node within ring?
					if (_c.contains(poly.nodes, node.id) || (Const.hitTestRect(node, rect) && Const.hitTestPointRing(node, points))) {
						hits.push(node.id);
					}
				}, this);
			}

			return hits;
		},
		
		// Tests a Rect for intersections with all nodes in the grid, and returns their ids.
		// @param id  The polygon id to test.
		// @return  Array of node ids that fall within the specified Rect.
		getNodesInRect: function(rect) {
			var hits = [];
			
			_c.each(this.nodes, function(node) {
				if (Const.hitTestRect(node, rect)) {
					hits.push(node.id);
				}
			}, this);

			return hits;
		},
		
		// Finds all adjacent line segments shared by two polygons.
		// @param p1  First polygon to compare.
		// @param p2  Second polygon to compare.
		// @returns  Array of arrays, each containing two node ids for a line segment.
		getAdjacentPolygonSegments: function(p1, p2) {
		  var result = [];
		  var ring1 = this.getNodesForPolygon(p1);
		  var ring2 = this.getNodesForPolygon(p2);
		  var len1 = ring1.length;
		  var len2 = ring2.length;
		  
		  for (var i=0; i < len1; i++) {
		    var a1 = ring1[i].id;
		    var b1 = ring1[(i+1) % len1].id;
		    
		    for (var j=0; j < len2; j++) {
		      var a2 = ring2[j].id;
  		    var b2 = ring2[(j+1) % len2].id;
  		    
  		    if (isSameSegment(a1, b1, a2, b2)) {
  		      result.push([a1, b1]);
		      }
	      }
		  }
		  return result;
		},
		
		// Gets an array of polygon ids that contain the specified line segment:
		getPolygonsWithLineSegment: function(n1, n2) {
			var result = [];
			
			_c.each(this.polys, function(poly, id) {
				// Loop through all polygon ring node pairs:
				for (var i=0, len=poly.nodes.length; i < len; i++) {
					var a = poly.nodes[i];
					var b = poly.nodes[(i+1) % len];
					
					// Retain polygon id if it matches the specified segment:
					if (isSameSegment(a, b, n1, n2)) {
						result.push(id);
					}
				}
			});
			return result;
		},
		
		// Maps the grid into descrete node fragments.
		// Each fragment contains the IDs of contiguously joined nodes.
		getContiguousNodesMap: function() {
			var fragments = [];
			var mapped = {};
			var grid = this;
			
			function followNode(node, fragment) {
				// Record node as mapped and belonging to the current fragment:
				mapped[node.id] = fragment[node.id] = 1;
				
				for (var id in node.to) {
					if (node.to.hasOwnProperty(id) && !fragment.hasOwnProperty(id)) {
						fragment = followNode(grid.getNodeById(id), fragment);
					}
				}
				return fragment;
			}
			
			_c.each(this.nodes, function(node) {
				if (!mapped.hasOwnProperty(node.id)) {
					fragments.push(followNode(node, {}));
				}
			});
			
			return fragments;
		},
		
		// Creates a path between two external (non-grid) points, using the grid to navigate between them.
		// Start and goal points will be integrated as best as possible into the grid, then route between.
		// @param a  Starting Point object to path from.
		// @param b  Goal Point object to bridge to.
		// @param confineToGrid  Specify TRUE to lock final route point to within the grid.
		// @return  an array of Point objects specifying a path to follow.
		bridgePoints: function(a, b, confineToGrid) {
			
			// 1) Connect points through common polygon.
			// 2) Connect points through adjacent polygon.
			// 3) Snap points to grid, connect anchors to segment and related polys.
			// 4) Direct connect points on common line segment.
			// 5) Direct connect points in common polygon.
			
			// Connect points through a common polygon:
			// Get polygon intersections for each point.
			var polysA = this.getPolygonsOverPoint(a);
			var polysB = this.getPolygonsOverPoint(b);
			
			// Test if points can be bridged through the polygon grid:
			// If so, a direction connection can be made.
			if (testBridgeViaPolys(this, a, b, polysA, polysB)) {
				return [a, b];
			}
			
			// Connect temporary anchors to the node grid via polygons:
			var anchorA = createBridgeAnchor(this, a, polysA);
			var anchorB = createBridgeAnchor(this, b, polysB);

			if (testBridgeViaAnchors(anchorA, anchorB)) {
				this.joinNodes(anchorA.id, anchorB.id);
			}
			
			// Find path then remove nodes:
			var path = this.findPath(anchorA.id, anchorB.id);
			this.removeNodes(anchorA.id, anchorB.id);
			
			if (path.valid) {
				path = _c.map(path.nodes, function(node) {
					return node.toPoint();
				});
				
				// Add start point:
				if (Const.distance(a, anchorA) > 1) {
					path.unshift(a);
				}
				
				// Add goal point:
				if (!confineToGrid && Const.distance(b, anchorB) > 1) {
					path.push(b);
				}
				
				return path;
			}
			
			// Return empty array if errors were encountered:
			return [];
		}
	};
	
	function testBridgeViaPolys(grid, a, b, polysA, polysB) {
		// If both points have polygon intersections,
		if (polysA.length && polysB.length) {
			
			// search for a common polygon:
			for (var i=0; i < polysA.length; i++) {
				if (_c.contains(polysB, polysA[i])) {
					return true;
				}
			}

			// Then check polygons for adjacent sides,
			var adjacent = grid.getAdjacentPolygonSegments(polysA, polysB);
			
			// search adjacent sides for an intersection with segment AB:
			for (i=0; i < adjacent.length; i++) {
				var n = _c.map(adjacent[i], grid.getNodeById, grid);
				if (Const.intersect(a, b, n[0], n[1])) {
					return true;
				}
			}
		}
		return false;
	}
	
	function createBridgeAnchor(grid, pt, polys) {
		var anchor = grid.addNode(pt.x, pt.y, {});

		// Attach to grid if there are no polygons to hook into:
		// this may generate some new polygons for the point.
		if (!polys.length) {
			var snap = grid.snapPointToGrid(pt);
			
			if (snap.point) {
				anchor.x = snap.point.x;
				anchor.y = snap.point.y;
				anchor.snap = snap;
				
				// Attach to snapped segment:
				for (var i=0, len=snap.segment.length; i < len; i++) {
					grid.joinNodes(anchor.id, snap.segment[i]);
				}
				
				// Find polygons for new segment:
				polys = grid.getPolygonsWithLineSegment(snap.segment[0], snap.segment[1]);
			}
		}
		
		// Attach node to related polygon geometry:
		if (polys.length) {
			anchor.poly = polys;
			
			_c.each(polys, function(id) {
				var nodes = grid.getPolygonById(id).nodes;
				
				for (var i=0, len=nodes.length; i < len; i++) {
					grid.joinNodes(anchor.id, nodes[i]);
				}
			});
		}
		
		return anchor;
	}
	
	function testBridgeViaAnchors(anchor1, anchor2) {
		// Test for common line segment:
		if (anchor1.snap && anchor2.snap) {
			var s1 = anchor1.snap.segment;
			var s2 = anchor2.snap.segment;
			if (isSameSegment(s1[0], s1[1], s2[0], s2[1])) {
				return true;
			}
		}
		
		// Test for common polygon:
		if (anchor1.poly && anchor2.poly) {
			for (var i in anchor1.poly) {
				if (_c.contains(anchor2.poly, anchor1.poly[i])) {
					return true;
				}
			}
		}
		
		return false;
	}
	
	return Const;
}));