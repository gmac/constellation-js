// Constellation.js 0.2.0

// (c) 2011-2013 Greg MacWilliam
// Constellation may be freely distributed under the MIT license
// Docs: https://github.com/gmac/constellation.js
(function() {
	
	var Const = Const || {};
	
	var Pilot = Const.Pilot = function(id, grid) {
		this.id = id || '';
		this._h = {};
		this.setGrid(grid);
	};
	
	Pilot.prototype = {
		grid: new Const.Grid(),
		data: {},
		id: '',
		x: 0,
		y: 0,
		rate: 10, // px per second
		turn: 0,
		playing: false,
		
		path: null,
		pathIndex: 0,
		action: null,

        // Add a listener:
        on: function(eventName, handler, context) {
            (this._h[eventName] = this._h[eventName] || []).push({
				h: handler,
				c: context
			});
            return this;
        },
		
        // Remove a listener:
        off: function(eventName, handler, context) {
			for (var list = this._h[eventName], i = 0, sub; list && handler && (sub = list[i]); i++) {
				if (sub.h === handler && (!context || sub.c === context)) list.splice(i--, 1);
			}
			
			if (list && !i) list.length = 0;
			if (!list) this._h = {};
			return this;
        },
		
		// Trigger an event:
        trigger: function(eventName) {
            for (var list = this._h[eventName], i = 0, sub; list && (sub = list[i++]);) {
                sub.h.apply(sub.c, list.slice.call(arguments, 1));
            }
            return this;
        },
		
		// Sets the pilot's Constellation Grid to follow:
		setGrid: function(grid) {
			if (grid && grid instanceof Const.Grid) {
				this.grid = grid;
			}
		},
		
		// Starts the pilot animating to a specified point:
		to: function(to, confineToGrid) {
			this.reset();
			
			if (this.grid) {
				var path = this.grid.bridgeNodes(this, to, confineToGrid);
				this.pathIndex = 1;
				this.play();
			}
		},
		
		// Stops and clears the pilot's queued animations:
		reset: function() {
			this.pause();
			this.path = null;
			this.pathIndex = 0;
		},
		
		// Starts/resumes playback to the pilot's animation sequence:
		play: function() {
			if (this.path && this.pathIndex) {
				this.playing = true;
				this.update();
			}
		},
		
		// Suspends playback of the pilot's current animation sequence:
		pause: function() {
			this.playing = false;
		},
		
		// Animation frame callback provider:
		// uses requestAnimationFrame shim by default,
		// may be overridden to hook animations into a different framerate manager.
		getAnimFrame: function() {
			return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function( callback ) { window.setTimeout(callback, 1000 / 60); };
		}(),
		
		// Updates the pilot with each animation frame:
		// will queue next frame after each update.
		update: function() {
			if (!this.playing) return;
			
			
			
			// Queue next animation frame:
			var self = this;
			this._f = this._f || function() { self.update(); };
			this.getAnimFrame(this._f);
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