define([
	'lib/jquery',
	'lib/backbone',
	'./grid-c',
	'./grid-m'
],
function( $, Backbone, gridController, gridModel ) {
	
	var MessageView = Backbone.View.extend({
		el: '#message',
		
		initialize: function() {
			this.listenTo(gridController, 'alert', this.onAlert);
			this.listenTo(gridModel, 'change', this.onTestEmpty);
			this.$el.hide();
		},

		onTestEmpty: function() {
			if (!gridModel.getNumNodes()) {
				this.$el
					.clearQueue()
					.text('Double-click to add points...')
					.show();
			}
		},
		
		onAlert: function(message) {
			if (gridModel.getNumNodes() > 0) {
				this.$el
					.clearQueue()
					.text(message)
					.show()
					.delay(2500)
					.fadeOut(500);
			}
		}
	});
	
	return new MessageView();
});