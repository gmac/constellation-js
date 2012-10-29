/**
* Keyboard controls.
* Configures keyboard shortcuts for calling controller methods.
*/
define([
	'lib/jquery',
	'mod/grid-controller'
],
function( $, gridController ) {
	
	var _enabled = true;
	
	$(window).on('keydown', function( evt ) {
		if (_enabled) {
			switch ( evt.which ) {
				case 8: gridController.deleteGeometry(); break; // "delete"
				case 66: gridController.splitNodes(); break; // "b"
				case 74: gridController.joinNodes(); break; // "j"
				case 80: gridController.makePolygon(); break; // "p"
				case 70: gridController.runPathfinder(); break; // "f"
				case 83: gridController.snapNodeToGrid(); break; // "s"
				case 78: gridController.selectNearestGridNode(); break; // "n"
				case 72: gridController.hitTestNodeInPolygons(); break; // "h"
			}
			//console.log( evt.which );
			return false;
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