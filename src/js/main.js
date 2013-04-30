define([
	'mod/grid-v',
	'mod/toolbar-v',
	'mod/grid-index-m',
	'mod/grid-m'
],
function( gridView, toolsView, indexModel, gridModel ) {
	
	// Startup application...
	// Fetch list of all available saved layouts:
	indexModel.fetch({
		success: function() {
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