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
		},
		requirejs: {
			compile: {
				options: {
					appDir: "./",
				    baseUrl: "js",
				    dir: "../dist",
					optimize: "uglify",
					optimizeCss: "standard",
					exclude: [
						"r.js",
						"js/app.build.js"
					],
					fileExclusionRegExp: /^test$|[-]?test[-]?|^node_modules$|^grunt.js$/,
				    modules: [
				        {
				            name: "main"
				        }
				    ]
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.registerTask("default", "concat min requirejs");
};