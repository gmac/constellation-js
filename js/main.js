requirejs.config({
    urlArgs: "bust="+(new Date()).getTime()
});

define([
	'mod/grid-view',
	'mod/tools-view',
	'mod/tools-keyboard'
],
function( gridView, toolsView ) {
	
	require(['mod/grid-model'], function(model) {
		model.addNode(100, 100);
		model.addNode(200, 200);
	});
	
});