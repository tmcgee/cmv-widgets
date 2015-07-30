module.exports = function(grunt){

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		watch: {
			options: {
				livereload: true
			}
		},

		connect: {
		    dev: {
		        options: {
		            //port: '?',
		            port: '62332',
		            base: '',
		            hostname: '*'
		            //open: ''
		            //open: '//localhost:50390/node_modules/intern/client.html',
		            //open: true
		        }
	        }
        },
		open: {
			dev: {
			    path: 'http://localhost:62332/tests/Export/index.html'
			}
		}
	});
 

	// load the tasks
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-open');

	// define the tasks
	grunt.registerTask('dev', ['connect:dev', 'open:dev', 'watch']);

};