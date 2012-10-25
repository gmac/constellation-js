/**
* constellation.js
* A point-based grid layout and geometry search application by Greg MacWilliam.
* Released under MIT license.
*/

// JSLint options:
/*global define, console */
/*jslint browser: true, white: true, plusplus: true */

(function( sqrt, min, abs ) {
	"use strict";
	
	var Const = window.constellation = {};
	
	Const.Point = function( x, y ) {
		this.x = x || 0;
		this.y = y || 0;
	};

	Const.Node = function( id, x, y, to ) {
		this.id = id;
		this.x = x || 0;
		this.y = y || 0;
		this.to = to || {};
	};
	
	Const.Polygon = function( id, nodes ) {
		this.id = id;
		this.nodes = nodes.slice();
		this.sides = nodes.length;
	};
	
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
	// @param p: The point to test.
	// @param points: An array of points to find the nearest neighbor within.
	// @return: nearst point from list of points.
	Const.findClosestPoint = function(p, points) {
		var i = points.length-1,
			a,
			dist,
			bestPt,
			bestDist = NaN;

		// Sort points by horizontal offset from P.
		points.sort(function(a, b) {
			a = abs(p.x-a.x);
			b = abs(p.x-b.x);
			return b - a;
		});
	
		while ( i >= 0) {
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
	
	Const.Grid = function(nodes, polys) {
		this.setData(nodes, polys);
	};
	Const.Grid.prototype = {
		nodes: null,
		polys: null,
		
		setData: function( nodes, polys ) {
			this.nodes = nodes || {};
			this.polys = polys || {};

			if (this.nodes instanceof Array) {
				this.nodes = this.makeTable( this.nodes );
			}
			if (this.polys instanceof Array) {
				this.polys = this.makeTable( this.polys );
			}
		},
		
		makeTable: function( geoms ) {
			var table = {},
				item,
				i;
				
			for ( i in geoms ) {
				if ( geoms.hasOwnProperty(i) ) {
					item = geoms[i];
					table[ item.id ] = item;
				}
			}
			return table;
		},
		
		destroy: function() {
			this.nodes = this.polys = null;
		},
		
		getNode: function( ref ) {
			if (typeof(ref) === 'string') {
				return this.nodes[ ref ];
			}
			return ref;
		},
		
		// Finds the shortest path between two nodes among the grid of nodes.
		// @param startNode: The node within the seach grid to start at.
		// @param goalNode: The node within the search grid to reach via shortest path.
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
		findPath: function(startNode, goalNode) {
			
			function Path(nodes, length, estimate) {
				this.nodes = (nodes || []);
				this.length = (length || 0);
				this.estimate = (estimate || 0);
			}
			Path.prototype = {
				nodes: null,
				length: 0,
				estimate: 0,
				copy: function(length, estimate) {
					return new Path(this.nodes.slice(), (length || this.length), (estimate || this.estimate));
				},
				last: function() {
					return this.nodes[ this.nodes.length-1 ];
				},
				contains: function(node) {
					var i;

					// Find via indexOf().
					if (!!this.nodes.indexOf) {
						return this.nodes.indexOf(node) >= 0;
					}

					// Find via loop.
					for (i in this.nodes) {
						if (this.nodes.hasOwnProperty(i) && this.nodes[i] === node) {
							return true;
						}
					}

					// Not in array.
					return false;
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
				cycles = 0,
				i;

			// Replace start/goal string ids with node references.
			startNode = this.getNode( startNode );
			goalNode = this.getNode( goalNode );
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
		
		snapPointToGrid: function( p ) {
			var a,
				b,
				snapped,
				offset,
				bestPoint = null,
				bestDistance = NaN,
				tested = {},
				i,
				j;

			p = this.getNode(p);

			// Loop through all grid nodes.
			for ( i in this.nodes ) {
				if ( this.nodes.hasOwnProperty(i) && p.id !== i ) {
					a = this.nodes[i];

					// Loop through each node's connections.
					for (j in a.to) {
						if (a.to.hasOwnProperty(j) && !tested.hasOwnProperty(j+' '+a.id)) {
							b = this.nodes[j];
							snapped = Const.snapPointToLine(p, a, b);
							offset = Const.distance(p, snapped);
							tested[a.id+' '+b.id] = true;

							if (!bestPoint || offset < bestDistance) {
								bestPoint = snapped;
								bestDistance = offset;
							}
						}
					}

				}
			}

			return bestPoint;
		}
	};
	
	// Define as AMD module.
	if (window.define && define.amd) {
		define(Const);
	}
	
}( Math.sqrt, Math.min, Math.abs ));