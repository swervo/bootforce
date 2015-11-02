/* global module */

module.exports = function(grunt) {
    'use strict';
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
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
        'env': {
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
        'preprocess': {
            dev: {
                files: {
                    'app/index.html': 'app/tmpl/index.html',
                    'app/callback.html': 'app/tmpl/index.html'
                }
            },
            prod: {
                files: {
                    'dist/index.html': 'app/tmpl/index.html',
                    'dist/callback.html': 'app/tmpl/index.html'
                }
            }
        },
        'watch': {
            files: ['app/sass/**/*.scss', 'app/scripts/**/*.js', 'app/tmpl/**/*.html'],
            tasks: ['preprocess', 'sassCompile'],
            options: {
                spawn: false,
                livereload: true
            }
        },
        'jshint': {
            files: ['Gruntfile.js', 'app/scripts/**/*.js'],
            options: {
                jshintrc: true
            }
        },
        'sass': {
            options: {
                sourceMap: true,
                outputStyle: 'expanded',
                sourceComments: false,
                includePaths: [
                    'app/lib/salesforce-lightning-design-system/scss'
                ]
            },
            dist: {
                files: {
                    'app/styles/main.css': 'app/sass/main.scss'
                }
            }
        },
        'connect': {
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
                    base: 'dist',
                    keepalive: true
                }
            }
        },
        'requirejs': {
            all:{
                options: {
                    baseUrl: 'app/scripts',
                    mainConfigFile: 'app/scripts/main.js',
                    name: '../lib/almond/almond',
                    include: ['main'],
                    insertRequire: ['main'],
                    removeCombined: true,
                    out: 'dist/scripts/main-built.js',
                    optimize: 'uglify2',
                    uglify2: {
                        screwIE8: true,
                        mangle: false,
                        sourceMap: true,
                        compress: {
                            dead_code: true,
                        },
                        warnings: true,
                    }
                }
            },
            bootforce: {
                options: {
                    baseUrl: 'app/scripts',
                    mainConfigFile: 'app/scripts/modules/components/main.js',
                    name: '../lib/almond/almond',
                    include: ['modules/components/main.js'],
                    insertRequire: ['modules/components/main.js'],
                    removeCombined: true,
                    out: 'dist/scripts/bootforce-built.js',
                    optimize: 'uglify2',
                    uglify2: {
                        screwIE8: true,
                        mangle: false,
                        sourceMap: true,
                        compress: {
                            dead_code: true,
                        },
                        warnings: true,
                    }
                }
            }
        },
        'imagemin': {
            png: {
                options: {
                    optimizationLevel: 7
                },
                files: [{
                    expand: true,
                    cwd: 'app/assets/',
                    src: ['**/*.png'],
                    dest: 'dist/assets/',
                    ext: '.png'
                }]
            },
            jpg: {
                options: {
                    progressive: true
                },
                files: [{
                    expand: true,
                    cwd: 'app/assets/',
                    src: ['**/*.jpg'],
                    dest: 'dist/assets/',
                    ext: '.jpg'
                }]
            }
        },
        'copy': {
            static: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: 'app',
                    dest: 'dist',
                    src: [
                        'styles/{,*/}**',
                        'assets/fonts/{,*/}**',
                        'assets/icons/{,*/}**',
                        'assets/images/{,*/}**'
                    ]
                }]
            }
        },
        'notify': {
            sass: {
                options: {
                    title: 'SASS task done',
                    message: 'Styles have been recompiled'
                }
            }
        }
    });

    // Bower integration
    grunt.registerTask('bower', [
        'bower-install-simple'
    ]);

    // Web Servers
    grunt.registerTask('server-dev', ['connect:build']);
    grunt.registerTask('server-prod', ['connect:deploy']);
    grunt.registerTask('server', ['server-dev']);

    // SASS build
    grunt.registerTask('sassCompile', ['sass', 'notify:sass']);

    grunt.registerTask('build', ['jshint', 'bower', 'requirejs:all', 'env:prod',
                                    'copy:static', 'preprocess:prod']);
    grunt.registerTask('bd', ['build', 'server-prod']);

    grunt.registerTask('default', ['env:dev', 'preprocess:dev', 'server-dev', 'watch']);
};
