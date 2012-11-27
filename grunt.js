module.exports = function(grunt) {
  grunt.initConfig({
    lint: { all: ['js/*.js'] },
    concat: { 'build/srcsetfill.js': [
      'js/libs/*',
      'js/*.js'
      ]
    },
    min: { 'build/srcset.min.js': ['build/srcset.js'] },
  });

  grunt.registerTask('default', 'lint concat min');
};