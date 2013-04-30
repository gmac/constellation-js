/**
* Keyboard controls.
* Configures keyboard shortcuts for calling controller methods.
*/
define([
	'lib/jquery',
	'./grid-c'
],
function( $, gridController ) {
	
	var _enabled = true;
	
	$(window).on('keydown', function( evt ) {
		if (_enabled) {
			switch ( evt.which ) {
				case 82: gridController.deleteGeometry(); return false; // "delete"
				case 66: gridController.splitNodes(); return false; // "b"
				case 74: gridController.joinNodes(); return false; // "j"
				case 80: gridController.makePolygon(); return false; // "p"
				case 70: gridController.runPathfinder(); return false; // "f"
				case 83: gridController.snapNodeToGrid(); return false; // "s"
				case 78: gridController.selectNearestGridNode(); return false; // "n"
				case 72: gridController.hitTestNodeInPolygons(); return false; // "h"
				case 49: gridController.newGrid(); return false; // "1"
				case 50: gridController.saveGrid(); return false; // "2"
				//case 51: gridController.saveGrid(); return false; // "2"
			}
			//console.log( evt.which );
		}
	});
	
	return {
		enable: function() {
			_enabled = true;
		},
		disable: function() {
			_enabled = false;
		},
		getEnabled: function() {
			return _enabled;
		}
	};
});