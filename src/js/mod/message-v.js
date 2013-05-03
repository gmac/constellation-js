define([
	'lib/jquery',
	'lib/backbone',
	'./grid-c',
	'./grid-m'
],
function( $, Backbone, gridController, gridModel ) {
	
	var MessageView = Backbone.View.extend({
		el: '#message',
		empty: false,
		
		initialize: function() {
			this.listenTo(gridController, 'alert', this.onAlert);
			this.listenTo(gridModel, 'change', this.onTestEmpty);
			this.$el.hide();
		},
		
		onTestEmpty: function() {
			if (!gridModel.getNumNodes()) {
				this.$el.clearQueue().html('Double-click to add nodes...<span>Click and drag for selection marquee</span>').fadeIn();
				this.empty = true;
			} else if (this.empty) {
				this.$el.clearQueue().fadeOut(500);
				this.empty = false;
			}
		},
		
		onAlert: function(message, multi) {
			if (gridModel.getNumNodes() > 0) {
				this.$el
					.clearQueue()
					.html(message + (multi ? '<span>SHIFT+click adds to selection</span>' : ''))
					.show()
					.delay(2500)
					.fadeOut(500);
			} else {
				this.$el.clearQueue()
					.animate({marginLeft:"-=5px"}, 50)
					.animate({marginLeft:"+=10px"}, 100)
					.animate({marginLeft:"-=10px"}, 100)
					.animate({marginLeft:"+=10px"}, 100)
					.animate({marginLeft:"-=5px"}, 50);
			}
		}
	});
	
	return new MessageView();
});