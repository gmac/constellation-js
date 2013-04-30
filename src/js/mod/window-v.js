define([
	'lib/jquery',
	'lib/underscore',
	'lib/backbone'
],
function( $, _, Backbone ) {
	
	function WindowSize() {
		var self = this;
		var win = $(window);
		
		function size() {
			self.width = win.width();
			self.height = win.height();
		}
		
		// Extend instance with Backbone events.
		_.extend(self, Backbone.Events);
		
		// Define public resize event.
		self.RESIZE = 'resize';
		
		// Listen for window resize.
		win.on('resize', function() {
			size();
			self.trigger( self.RESIZE );
		});
		
		// Set default size.
		size();
	}
	
	return new WindowSize();
});