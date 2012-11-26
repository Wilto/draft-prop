module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-requirejs');
  grunt.initConfig({
    lint: { all: ['js/*.js', 'tests/*.js'] },
    concat: { 'build/srcset.js': [
      'js/libs/*',
      'js/*.js'
      ]
    },
    min: { 'build/srcset.min.js': ['build/srcset.js'] },
  });

  grunt.registerTask('default', 'lint concat min');
};