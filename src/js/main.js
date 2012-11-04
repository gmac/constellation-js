define([
	'mod/grid-view',
	'mod/tools-view',
	'mod/grid-index-model',
	'mod/grid-model'
],
function( gridView, toolsView, indexModel, gridModel ) {
	
	indexModel.fetch({
		success: function( collect, response ) {
			if ( indexModel.models.length ) {
				gridModel.loadGrid( indexModel.at(0).id );
			} else {
				gridModel.newGrid();
			}
		}
	});
	
});