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
			this.listenTo(gridModel, 'change', this.onEmpty);
			this.$el.hide();
		},
		
		render: function() {
			
		},
		
		onEmpty: function() {
			this.$el.text('Double-click to add points...');
		},
		
		onAlert: function(message) {
			this.$el.text(message).show().delay(2000).fadeOut(500);
		}
	});
	
	return new MessageView();
});