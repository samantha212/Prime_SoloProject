module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            build: {
                files: [{
                    expand: true,
                    src: 'client/*.js',
                    dest: 'server/public/assets/scripts',
                    ext: '.min.js'
                }]
            }
        },
        watch: {
            scripts: {
                files: ['client/client.js', 'client/registration.js', 'client/login.js'],
                 tasks: ['uglify'],
                options: {
                    spawn: false
                }
            }
        },
        copy: {
            main: {
                expand: true,
                cwd: "node_modules/",
                src: [
                    "angular/angular.min.js",
                    "angular/angular.min.js.map",
                    "angular-route/angular-route.min.js"
                ],
                dest: "server/public/vendor/"
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['copy', 'uglify']);
};
