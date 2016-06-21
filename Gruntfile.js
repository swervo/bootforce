/* global module */

module.exports = function(grunt) {
    'use strict';
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*!\n' +
            ' * Bootforce v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
            ' * Bootforce owes much to Bootstrap "http://getbootstrap.com"\n' +
            ' * Licensed under the <%= pkg.license %> license\n' +
            ' */\n',
        'bower-install-simple': {
            options: {
                color: true,
                directory: 'app/lib'
            },
            'prod': {
                options: {
                    production: true
                }
            },
            'dev': {
                options: {
                    production: false
                }
            }
        },
        env: {
            options: {
                /* Shared Options Hash */
                //globalOption : 'foo'
            },
            dev: {
                NODE_ENV: 'DEVELOPMENT'
            },
            prod: {
                NODE_ENV: 'PRODUCTION'
            }
        },
        preprocess: {
            dev: {
                files: {
                    'app/index.html': 'app/tmpl/index.html',
                    'app/callback.html': 'app/tmpl/index.html'
                }
            },
            prod: {
                files: {
                    'build/index.html': 'app/tmpl/index.html',
                    'build/callback.html': 'app/tmpl/index.html'
                }
            }
        },
        watch: {
            files: ['app/sass/**/*.scss', 'app/scripts/**/*.js', 'app/tmpl/**/*.html'],
            tasks: ['preprocess', 'sassCompile'],
            options: {
                spawn: false,
                livereload: true
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'app/scripts/**/*.js'],
            options: {
                jshintrc: true
            }
        },
        sass: {
            options: {
                sourceMap: true,
                outputStyle: 'expanded',
                sourceComments: false,
                includePaths: [
                    'node_modules/@salesforce-ux/design-system/scss',
                    'node_modules/github-fork-ribbon-css/'
                ]
            },
            dist: {
                files: {
                    'app/styles/main.css': 'app/sass/main.scss'
                }
            }
        },
        connect: {
            build: {
                options: {
                    port: 8000,
                    base: 'app',
                    keepalive: false,
                    livereload: true
                }
            },
            deploy: {
                options: {
                    port: 8001,
                    base: 'build',
                    keepalive: true
                }
            }
        },
        copy: {
            static: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: 'app',
                    dest: 'build',
                    src: [
                        'styles/{,*/}**',
                        'assets/fonts/{,*/}**',
                        'assets/icons/{,*/}**',
                        'assets/images/{,*/}**',
                        'assets/logo/{,*/}**'
                    ]
                }]
            },
            dev: {
                files: [{
                    dest: 'build/dist/scripts/bootforce.min.js',
                    src: 'dist/bootforce.min.js'
                }]
            },
            data: {
                files: [{
                    dest: 'build/scripts/todos.json',
                    src: 'app/scripts/todos.json'
                }]
            }
        },
        notify: {
            sass: {
                options: {
                    title: 'SASS task done',
                    message: 'Styles have been recompiled'
                }
            }
        }
    });

    // Bower integration
    // grunt.registerTask('bower', ['bower-install-simple']);

    grunt.registerTask('server', ['connect:build']);

    grunt.registerTask('sassCompile', ['sass', 'notify:sass']);

    // grunt.registerTask('dist', ['requirejs:bootforce', 'uglify:bootforce']);
    // grunt.registerTask('main', ['requirejs:main', 'uglify:main']);

    grunt.registerTask('build', [
        'jshint',
        'env:prod',
        'copy:static',
        'copy:dev',
        'copy:data',
        'preprocess:prod',
        'connect:deploy'
    ]);

    grunt.registerTask('default', [
        'env:dev',
        'preprocess:dev',
        'server',
        'watch'
    ]);
};
