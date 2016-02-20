// # Task automation for tweetmap
//
// Run various tasks when developing for and working with tweetmap.
//
// **Usage instructions:** can be found in the [Custom Tasks](#custom%20tasks) section or by running `grunt --help`.
//
// **Debug tip:** If you have any problems with any Grunt tasks, try running them with the `--verbose` command

// ## Grunt configuration

var configureGrunt = function (grunt) {
        // #### Load all grunt tasks
        //
        // Find all of the task which start with `grunt-` and load them, rather than explicitly declaring them all
        require('matchdep').filterDev(['grunt-*', '!grunt-cli']).forEach(grunt.loadNpmTasks);

        var cfg = {
            // Standard build type, for when we have nightlies again.
            buildType: 'Build',
            // Load package.json so that we can create correctly versioned releases.
            pkg: grunt.file.readJSON('package.json'),

            // ### grunt-contrib-jshint
            // Linting rules, run as part of `grunt validate`. See [grunt validate](#validate) and its subtasks for
            // more information.
            jshint: {
                options: {
                    jshintrc: true
                },

                server: [
                    '*.js',
                    '!config*.js', // note: i added this, do we want this linted?
                    'core/*.js',
                    'core/server/**/*.js'
                ]
            },

            jscs: {
                options: {
                    config: true
                },

                server: {
                    files: {
                        src: [
                            '*.js',
                            '!config*.js', // note: i added this, do we want this linted?
                            'core/*.js',
                            'core/server/**/*.js'
                        ]
                    }
                }
            },

            // ### grunt-docker
            // Generate documentation from code
            docker: {
                docs: {
                    dest: 'docs',
                    src: ['.'],
                    options: {
                        onlyUpdated: true,
                        exclude: 'node_modules,bower_components,content,core/client,*test,*doc*,' +
                        '*vendor,config.js,*buil*,.dist*,.idea,.git*,.travis.yml,.bower*,.editorconfig,.js*,*.md'
                    }
                }
            },

            // ### grunt-contrib-clean
            // Clean up files as part of other tasks
            clean: {
                dependencies: {
                    src: ['node_modules/**']
                }
            }
        };

        // Load the configuration
        grunt.initConfig(cfg);

        // # Custom Tasks

        // tweetmap has a number of useful tasks that we use every day in development. Tasks marked as *Utility* are used
        // by grunt to perform current actions, but isn't useful to developers.
        //
        // Skip ahead to the section on:
        //
        // * [Building assets](#building%20assets):
        //     `grunt init`, `grunt` & `grunt prod` or live reload with `grunt dev`
        // * [Testing](#testing):
        //     `grunt validate`, the `grunt test-*` sub-tasks or generate a coverage report with `grunt coverage`.

        // ### Documentation
        // Run `grunt docs` to generate annotated source code using the documentation described in the code comments.
        grunt.registerTask('docs', 'Generate Docs', ['docker']);

        // Runun `grunt watch-docs` to setup livereload & watch whilst you're editing the docs
        grunt.registerTask('watch-docs', function () {
            grunt.config.merge({
                watch: {
                    docs: {
                        files: ['core/server/**/*', 'index.js', 'Gruntfile.js', 'config.example.js'],
                        tasks: ['docker'],
                        options: {
                            livereload: true
                        }
                    }
                }
            });

            grunt.task.run('watch:docs');
        });

        // ### Lint
        //
        // `grunt lint` will run the linter and the code style checker so you can make sure your code is pretty
        grunt.registerTask('lint', 'Run the code style checks and linter',
            ['jshint', 'jscs']
        );
    };

module.exports = configureGrunt;
