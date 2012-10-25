/*
* Configures keyboard shortcuts for the application.
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