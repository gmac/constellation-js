define([
	'mod/grid-v',
	'mod/toolbar-v',
	'mod/grid-m',
	'mod/cache-m',
	'mod/keyboard-c'
],
function( gridView, toolsView, gridModel, cacheModel, keyboard ) {
	
	// Startup application...
	// Fetch list of all available saved layouts:
	cacheModel.fetch();
	
	if (!cacheModel.length) {
		cacheModel.newRecord();
	}
});