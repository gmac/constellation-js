module.exports = function( grunt ) {

	grunt.initConfig({
		concat: {
			dist: {
				src: 'js/lib/constellation.js',
				dest: '../constellation.js'
			}
		},
		min: {
			dist: {
				src: 'js/lib/constellation.js',
				dest: '../constellation.min.js'
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib');
	grunt.registerTask("default", "concat min");
};