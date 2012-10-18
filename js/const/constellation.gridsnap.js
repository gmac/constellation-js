// JSLint options:
/*global constellation, alert, console */
/*jslint browser: true, white: true, plusplus: true */

(function(core) {
"use strict";
	
core.snapToGrid = function() {
	var p,
		a,
		b,
		snap,
		offset,
		bestPoint,
		bestDistance,
		i,
		j,
		k,
		tested = {};
	
	if (!this.numSelections()) {
		alert('Please select exactly one node.');
		return;
	}
	
	// Loop through selection nodes.
	for (i in this.selection) {
		if (this.selection.hasOwnProperty(i)) {
			p = this.selection[i];
			bestPoint = null;
			bestDistance = NaN;
			
			// Loop through all grid nodes.
			for (j in this.nodes) {
				if (this.nodes.hasOwnProperty(j) && j !== i) {
					a = this.nodes[j];
					
					// Loop through each node's connections.
					for (k in a.to) {
						if (a.to.hasOwnProperty(k) && !tested.hasOwnProperty(k+'-'+a.id)) {
							b = this.nodes[k];
							snap = this.geom.snapPointToLine(p, a, b);
							offset = this.geom.distance(p, snap);
							tested[a.id+'-'+b.id] = true;
							
							if (!bestPoint || offset < bestDistance) {
								bestPoint = snap;
								bestDistance = offset;
							}
							
						}
					}
					
				}
			}
			
			// Plot point P at best available grid position.
			if (bestPoint) {
				p.plot(bestPoint.x, bestPoint.y);
			}
		}
	}
};

core.ready(function() {
	core.ui.addButton('grid snap', function() {
		core.snapToGrid();
	});
});

}(constellation));