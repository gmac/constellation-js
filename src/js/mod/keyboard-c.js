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
	
	$(window)
		.on('keydown', function(evt) {
			if (_enabled) {
				evt.preventDefault();
			
				switch ( evt.which ) {
					case 8: gridController.deleteGeometry(); return false; // "delete"
					case 66: gridController.splitNodes(); return false; // "b"
					case 74: gridController.joinNodes(); return false; // "j"
					case 80: gridController.makePolygon(); return false; // "p"
					case 70: gridController.findPath(); return false; // "f"
					case 83: gridController.snapNodeToGrid(); return false; // "s"
					case 78: evt.ctrlKey ? gridController.newGrid() : gridController.selectNearestGridNode(); return false; // "n"
					case 72: gridController.hitTestNodeInPolygons(); return false; // "h"
				}
				return false;
			}
			return true;
		})
		.on('focus', function(evt) {
			if (evt.target.tagName) {
				_enabled = !(evt.target.tagName.toLowerCase() === 'input');
			}
		})
		.on('blur', function(evt) {
			_enabled = true;
		});
});