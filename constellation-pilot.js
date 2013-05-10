// Constellation.js 0.2.0

// (c) 2011-2013 Greg MacWilliam
// Constellation may be freely distributed under the MIT license
// Docs: https://github.com/gmac/constellation.js
(function() {
	
	// RequestAnimFrame shim:
	var requestAnimFrame = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		function( callback ) { window.setTimeout(callback, 1000 / 60); };
	
	
	var Const = Const || {};
	
	var Pilot = Const.Pilot = function(grid) {
		this.setGrid(grid);
	};
	
	Pilot.prototype = {
		grid: new Const.Grid(),
		data: {},
		rate: 10, // px per second
		turn: 0,
		
		setGrid: function(grid) {
			if (grid && grid instanceof Const.Grid) {
				this.grid = grid;
			}
		},
		
		to: function(point, confineToGrid) {
			
		},
		
		getTurn: function(degrees) {
			// offset degrees to align the zero-mark with the vertical axis.
			degrees -= (180 + 45 + 23);
			
			// adjust degrees to fall within range of a circle.
			if ($degrees < 0) {
				$degrees+=360;
			}
			else if ($degrees > 360) {
				$degrees-=360;
			}
			return Math.ceil(($degrees / 360) * 8);
		}
	};
	
}());