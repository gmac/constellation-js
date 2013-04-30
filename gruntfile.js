module.exports = function( grunt ) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '// Constellation.js <%= pkg.version %>\n// (c) 2011-2013 Greg MacWilliam\n// Freely distributed under the MIT license\n// http://constellationjs.org\n'
			},
			root: {
				src: '<%= pkg.name %>.js',
				dest: '<%= pkg.name %>.min.js'
			},
			lib: {
				src: '<%= pkg.name %>.js',
				dest: 'src/js/lib/<%= pkg.name %>.js'
			}
		}
	});
	
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.registerTask("default", ["uglify"]);
};