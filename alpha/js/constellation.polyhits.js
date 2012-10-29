// JSLint options:
/*global constellation, alert, console */
/*jslint browser: true, white: true, plusplus: true */

(function(core) {
"use strict";
	
core.hitTestPolys = function() {
	var hits = 0,
		i,
		j;
	
	if (this.numSelections() === 1) {
		
		// Loop through selection nodes.
		for (i in this.selection) {
			if (this.selection.hasOwnProperty(i)) {

				// Loop through polygons.
				for (j in this.polys) {
					if (this.polys.hasOwnProperty(j)) {
						// Test for polygon hit
						if ( this.geom.hitTestPolygon(this.selection[i], this.polys[j].nodes) ) {
							hits+=1;
						}
					}
				}
			}
		}
		
		if (hits) {
			this.ui.output('Node falls within '+ hits +' polygon'+ (hits > 1 ? 's' : '') +'.');
		} else {
			this.ui.output('No polygon intersections.');
		}
		
	} else {
		alert('Please select exactly one node.');
	}
};

core.ready(function() {
	core.ui.addButton('poly hits', function() {
		core.hitTestPolys();
	});
});

}(constellation));