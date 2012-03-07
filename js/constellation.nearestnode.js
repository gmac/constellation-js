// JSLint options:
/*global constellation, alert, console */
/*jslint browser: true, white: true, plusplus: true */

(function(core) {
"use strict";
	
core.nearestNode = function() {
	var points = [],
		pt,
		i,
		p;

	if (this.numSelections() === 1) {
		
		for (i in this.nodes) {
			if (this.nodes.hasOwnProperty(i)) {
				p = this.nodes[i];

				if (p.selection > 0) {
					// Selected point.
					pt = p;
				} else {
					// Add other points to search group.
					points.push( p );
				}
			}
		}
		
		// Find the nearest point.
		pt = this.geom.findClosestPoint(pt, points);

		// If a point was found, select it.
		if (pt) {
			this.selectNode( pt.id );
			pt = null;
		}
		
		// Purge search array references.
		while (points.length) {
			points.pop();
		}
		points = null;
		
	} else {
		alert('Please select exactly one node.');
	}
};

core.ready(function() {
	core.ui.addButton('nearest node', function() {
		core.nearestNode();
	});
});

}(constellation));