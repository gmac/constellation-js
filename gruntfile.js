module.exports = function( grunt ) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
		uglify: {
			options: {
				banner: '// Constellation.js <%= pkg.version %>\n// (c) 2011-2013 Greg MacWilliam\n// Freely distributed under the MIT license\n// Docs: https://github.com/gmac/constellation.js\n'
			},
			root: {
				src: '<%= pkg.name %>.js',
				dest: '<%= pkg.name %>.min.js',
				sourceMapUrl: '<%= pkg.name %>.min.map',
				sourceMapRoot: './'
			},
			lib: {
				src: '<%= pkg.name %>.js',
				dest: 'src/js/lib/<%= pkg.name %>.js'
			}
		},
		
		requirejs: {
			dist: {
				options: {
					//almond: true,
					modules: [{
						name: 'main',
						exclude: ['lib/jquery']
					}],
					dir: "dist",
					appDir: "src",
					baseUrl: "js",
					mainConfigFile: "src/js/main.js"
				}
			}
		}
	});
	
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-requirejs");
	grunt.registerTask("default", ["uglify", "requirejs"]);
};