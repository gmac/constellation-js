define([
	'mod/grid-model',
	'mod/grid-selection-model'
],
function( gridModel, selectModel ) {
	
	return {
		joinNodes: function() {
			gridModel.joinNodes( selectModel.nodes );
		},
		splitNodes: function() {
			gridModel.splitNodes( selectModel.nodes );
		},
		makePolygon: function() {
			gridModel.addPolygon( selectModel.nodes );
		},
		deleteGeometry: function() {
			gridModel.removeNodes( selectModel.nodes );
			selectModel.deselectAllNodes();
		}
	};
});