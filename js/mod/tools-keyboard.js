/*
* Configures keyboard shortcuts for the application.
*/
define([
	'lib/jquery',
	'mod/tools-view'
],
function( $, toolsView ) {
	
	var _enabled = true;
	
	$(window).on('keydown', function( evt ) {
		if (_enabled) {
			switch ( evt.which ) {
				case 8: toolsView.deleteGeometry(); break; // "delete"
				case 66: toolsView.splitNodes(); break; // "b"
				case 74: toolsView.joinNodes(); break; // "j"
				case 80: toolsView.makePolygon(); break; // "p"
				default: return true;
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