// JSLint options:
/*global constellation, console */
/*jslint browser: true, white: true, plusplus: true */

(function(geom) {
	"use strict";

	/**
	* Path.
	*/
	function Path(nodes, length, estimate) {
		this.nodes = (nodes || []);
		this.length = (length || 0);
		this.estimate = (estimate || 0);
	}
	Path.prototype = {
		length:0,
		estimate:0,
		nodes:null,
		copy: function(length, estimate) {
			return new Path(this.nodes.slice(), (length || this.length), (estimate || this.estimate));
		},
		last: function() {
			return this.nodes[this.nodes.length-1];
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
		dispose: function() {
			this.nodes.length = 0;
			this.nodes = null;
		}
	};
	Path.report = function(path, cycles) {
		return {
			valid: !!path,
			length: (path ? path.length : 0),
			cycles: cycles,
			nodes: (path ? path.nodes : [])
		};
	};
	
	/**
	* Sort method for prioritizing a search queue of Path objects.
	* Lowest estimated path lenths are pushed to the end of the queue.
	* Shortest estimates will be popped from queue and searched first.
	*/
	Path.prioritize = function(a, b) {
		if (a.estimate < b.estimate) {
			return 1;
		} else if (a.estimate > b.estimate) {
			return -1;
		}
		return 0;
	};
	
	// Finds the shortest path between two nodes among the grid of nodes.
	// @param startNode: The node within the seach grid to start at.
	// @param goalNode: The node within the search grid to reach via shortest path.
	// @param searchGrid: The grid of nodes to search, formatted as:
	/* {
		n1: {id:"n1", x:25, y:25, to:{n2:true, n3:true}},
		n2: {id:"n2", x:110, y:110, to:{n1:true}},
		n3: {id:"n3", x:50, y:180, to:{n1:true}},
	} */
	// @return: A report on the search, including:
	//  @attr length: length of completed path.
	//  @attr cycles: number of cycles required to complete the search.
	//  @attr nodes: an array of path nodes, formatted as [startNode, ...connections, goalNode].
	geom.findGridPath = function(startNode, goalNode, searchGrid) {
	
		var queue = [], // Queue of paths to search, sorted by estimated length (longest to shortest).
			distances = {}, // Table of shortest distances found to each node id.
			bestPath = null, // The best completed path found to goal.
			searchPath, // A current path to be extended and searched.
			searchNode, // A current node to extend outward and searched from.
			branchPath, // A new path branch for the search queue.
			branchLength, // Actual length of a new branch being explored.
			branchEstimate, // Estimated best-case length of new branch reaching goal.
			cycles = 0,
			i;
	
		// Replace start/goal string ids with node references.
		if (typeof(startNode) === 'string') {
			startNode = searchGrid[ startNode ];
		}
		if (typeof(goalNode) === 'string') {
			goalNode = searchGrid[ goalNode ];
		}

		// Add default search path.
		queue.push( new Path([startNode]) );
	
		// While the queue contains paths:
		while (queue.length > 0) {
			searchPath = queue.pop();
			startNode = searchPath.last();
		
			// Extend search path outward to the next set of connections, creating X new paths.
			for (i in startNode.to) {
				if (startNode.to.hasOwnProperty(i)) {
					searchNode = searchGrid[ i ];
			
					// Reject loops.
					if (!!searchNode && !searchPath.contains( searchNode )) {
						branchLength = searchPath.length + geom.distance( startNode, searchNode );

						// Test branch fitness.
						if (branchLength <= (distances[searchNode.id] || branchLength)) {
							distances[searchNode.id] = branchLength;
							branchEstimate = branchLength + geom.distance( searchNode, goalNode );
							
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
			queue.sort(Path.prioritize);
			cycles++;
		}
	
		// Cleanup local references.
		queue = searchGrid = distances = goalNode = null;
	
		// Return best discovered path.
		return Path.report(bestPath, cycles);
	};

}(constellation.geom));