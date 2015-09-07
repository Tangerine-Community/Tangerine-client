
module.exports = function (grunt) {

    grunt.initConfig({

        dirs: {
            handlebars: 'src/templates'
        },

        // watch list
        watch: {

            handlebars: {
                files: ['<%= handlebars.compile.src %>'],
                tasks: ['handlebars:compile']
            },
        },

        handlebars: {
            compile: {
                options: {
                    amd: false
                },
                src: ["src/templates/**/*.handlebars"],
                dest: "src/js/lib-coco/precompiled.handlebars.js"
            }
        }

    });

    // Requires the needed plugin
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-contrib-watch');

};
