'use strict';

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg		: grunt.file.readJSON('package.json'),
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			gruntfile: {
				src: 'Gruntfile.js'
			},
			lib: {
				src: ['lib/**/*.js']
			},
			test: {
				options: {
					jshintrc: 'test/.jshintrc'
				},
				src: ['test/**/*.js']
			},
		},
		watch: {
			gruntfile: {
				files: '<%= jshint.gruntfile.src %>',
				tasks: ['jshint:gruntfile']
			},
			lib: {
				files: '<%= jshint.lib.src %>',
				tasks: ['jshint:lib', 'simplemocha']
			},
			test: {
				files: '<%= jshint.test.src %>',
				tasks: ['jshint:test', 'simplemocha']
			},
		},
		simplemocha	: {
			options	: {
				reporter	: "spec"
			},
			files	: ['test/**/*_test.js']
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task.
	grunt.registerTask('default', ['watch']);

};