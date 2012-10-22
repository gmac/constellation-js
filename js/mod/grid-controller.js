define([
	'mod/grid-model',
	'mod/grid-selection-model'
],
function( grid, selection ) {
	
	return {
		joinNodes: function() {
			grid.joinNodes( selection.getNodeSelection() );
		},
		splitNodes: function() {
			grid.splitNodes( selection.getNodeSelection() );
		},
		makePolygon: function() {
			console.log('polygon');
		},
		deleteGeometry: function() {
			grid.removeNodes( selection.getNodeSelection() );
			selection.deselectAllNodes();
		}
	};
});