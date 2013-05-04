define([
	'lib/jquery',
	'lib/backbone',
	'./window-v'
],
function( $, Backbone, windowView ) {
	
	var InfoView = Backbone.View.extend({
		el: '#info',

		events: {
			'click button': 'onToggle'
		},
		
		onToggle: function() {
			this.$el.toggleClass('closed');
			var open = !this.$el.hasClass('closed');
			var self = this;
				
			this.$win = this.$win || $(window);
			this.$win.off('click.info');
			
			if (open) {
				this.$win.on('click.info', function(evt) {
					if (!$(evt.target).closest(self.$el).length) {
						self.onToggle();
					}
				});
			}
			
			this.$('.toggle').text(open ? 'x' : '?');
		}
	});
	
	return new InfoView();
});