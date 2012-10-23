requirejs.config({
    urlArgs: "bust="+(new Date()).getTime()
});

define([
	'mod/grid-view',
	'mod/tools-view'
],
function( gridView, toolsView ) {
	
	require(['mod/grid-model'], function(model) {
		var join = [model.addNode(100, 100), model.addNode(200, 200), model.addNode(100, 300)];
		model.joinNodes( join );
		model.addPolygon( join );
	});
	
});