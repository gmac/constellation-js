requirejs.config({
	paths: {
		//'lib/constellation': '../../constellation'
	}
});

define([
	'mod/grid-v',
	'mod/toolbar-v',
	'mod/message-v',
	'mod/info-v',
	'mod/grid-m',
	'mod/keyboard-c'
],
function( gridView, toolsView, messageView, infoView, gridModel, keyboard ) {
	
	// Startup application...
	gridModel.load();
});