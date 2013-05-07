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
	
	function stop(evt) {
		evt.preventDefault();
	}
	
	$(window)
		.on('keydown', function(evt) {
			if (_enabled) {
				switch ( evt.which ) {
					case 8: stop(evt); gridController.deleteGeometry(); return false; // "delete"
					case 66: stop(evt); gridController.splitNodes(); return false; // "b"
					case 67: stop(evt); gridController.print(); return false; // "c"
					case 74: stop(evt); gridController.joinNodes(); return false; // "j"
					case 80: stop(evt); gridController.makePolygon(); return false; // "p"
					case 70: stop(evt); gridController.findPath(); return false; // "f"
					case 83: stop(evt); gridController.snapNodeToGrid(); return false; // "s"
					case 78: stop(evt); evt.ctrlKey ? gridController.newGrid() : gridController.selectNearestGridNode(); return false; // "n"
					case 72: stop(evt); gridController.hitTestGeometry(); return false; // "h"
				}
			}
			//console.log(evt.which);
		});
		
	$('input')
		.on('focus', function(evt) {
			_enabled = false;
		})
		.on('blur', function(evt) {
			_enabled = true;
		});
});