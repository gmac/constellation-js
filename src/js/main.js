define([
	'mod/grid-view',
	'mod/tools-view',
	'mod/grid-index-model',
	'mod/grid-model'
],
function( gridView, toolsView, indexModel, gridModel ) {
	
	// Startup application...
	// Fetch list of all available saved layouts:
	indexModel.fetch({
		success: function( collect, response ) {
			if ( indexModel.models.length ) {
				// Has saved layouts.
				// Load first saved layout.
				gridModel.loadGrid( indexModel.at(0).id );
			} else {
				// No saved layouts.
				// Create new grid.
				gridModel.newGrid();
			}
		}
	});
	
});