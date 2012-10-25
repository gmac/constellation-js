define([
	'lib/backbone',
	'mod/grid-model',
	'mod/grid-selection-model'
],
function( Backbone, gridModel, selectModel ) {
	
	var GridController = Backbone.Model.extend({
		ALERT: 'alert',
		
		joinNodes: function() {
			if (selectModel.type === gridModel.NODE) {
				gridModel.joinNodes( selectModel.items );
			} else {
				this.alert("Please select two or more nodes.");
			}
		},
		splitNodes: function() {
			if (selectModel.type === gridModel.NODE) {
				gridModel.splitNodes( selectModel.items );
			} else {
				this.alert("Please select two or more nodes.");
			}
		},
		makePolygon: function() {
			if (selectModel.type === gridModel.NODE) {
				gridModel.addPolygon( selectModel.items );
			} else {
				this.alert("Please select two or more nodes.");
			}
		},
		deleteGeometry: function() {
			if (selectModel.type === gridModel.NODE) {
				gridModel.removeNodes( selectModel.items );
			} else {
				gridModel.removePolygons( selectModel.items );
			}
			selectModel.deselectAll();
		},
		
		alert: function(mssg) {
			this.trigger( this.ALERT, mssg );
		}
	});
	
	return new GridController();
});