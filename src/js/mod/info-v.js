define([
	'lib/jquery',
	'lib/backbone',
	'./window-v'
],
function( $, Backbone, windowView ) {
	
	var InfoView = Backbone.View.extend({
		el: '#info',

		initialize: function() {
			this.$view = this.$el.find('.js-view').hide();
		},
		
		events: {
			'click button': 'onToggle'
		},
		
		onToggle: function() {
			this.$view.toggle();
		}
	});
	
	return new InfoView();
});