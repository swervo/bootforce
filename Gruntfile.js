/* global module */

'use strict';

var devConfig = require('./webpack.dev.config.js');
devConfig.entry.app.unshift('webpack-dev-server/client?http://localhost:8080/', 'webpack/hot/dev-server');
var webpackSharedConfig = require('./webpack.prod.config.js');

module.exports = function(grunt) {
    require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks);
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        webpack: {
            buildLib: webpackSharedConfig.buildLib,
            distApp: webpackSharedConfig.distApp,
            distLib: webpackSharedConfig.distLib
        },
        'webpack-dev-server': {
            options: {
                webpack: devConfig,
                contentBase: 'app/',
                publicPath: '/' + devConfig.output.publicPath,
                hot: true
            },
            start: {
                keepAlive: true,
                webpack: {
                    devtool: 'eval',
                    debug: true
                }
            }
        },
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*!\n' +
            ' * Bootforce v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
            ' * Bootforce owes much to Bootstrap "http://getbootstrap.com"\n' +
            ' * Licensed under the <%= pkg.license %> license\n' +
            ' */\n',
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
            }
        },
        jshint: {
            files: [
                'Gruntfile.js',
                'app/scripts/*.js',
                'app/scripts/modules/**/*.js',
                'app/scripts/org/**/*.js'
            ],
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
                    base: 'app',
                    keepalive: true
                }
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

    grunt.registerTask('server', ['connect:build']);

    grunt.registerTask('sassCompile', ['sass', 'notify:sass']);

    grunt.registerTask('default', [
        'env:dev',
        'preprocess:dev',
        'webpack-dev-server:start',
    ]);

    grunt.registerTask('build', [
        'jshint',
        'env:prod',
        'preprocess:dev',
        'sassCompile',
        'webpack:distApp',
        'webpack:buildLib',
        'webpack:distLib',
        'connect:deploy'
    ]);
};
