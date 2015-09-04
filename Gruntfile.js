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
        'jshint': {
            files: ['Gruntfile.js', 'app/scripts/**/*.js'],
            options: {
                globals: {
                    jQuery: false
                }
            }
        },
        'sass': {
            options: {
                sourceMap: true,
                outputStyle: 'expanded',
                sourceComments: false,
                includePaths: ['app/slds/scss']
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
                    keepalive: true
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
            compile: {
                options: {
                    baseUrl: 'app/scripts',
                    name: 'main',
                    out: 'dist/scripts/main.js',
                    mainConfigFile: 'app/scripts/main.js',
                    optimize: 'uglify2',
                    uglify2: {
                        screwIE8: true,
                        mangle: true,
                        sourceMap: true,
                        compress: {
                            dead_code: true,
                        },
                        warnings: false,
                    },
                    fileExclusionRegExp: /^assets$/, // ignore assets directory, imagemin will handle this instead
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
                        '*.html',
                        'styles/{,*/}**',
                        'assets/fonts/{,*/}**',
                        'assets/sfx/{,*/}**'
                    ]
                }, {
                    expand: true,
                    dot: true,
                    cwd: 'app/lib/requirejs',
                    dest: 'dist/lib/requirejs',
                    src: [
                        'require.js'
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

    // Used by travis
    grunt.registerTask('build', ['jshint', 'bower', 'requirejs', 'imagemin', 'copy:static']);
    grunt.registerTask('test', []);

    grunt.registerTask('default', ['jshint']);
};
