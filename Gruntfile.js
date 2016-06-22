/* global module */

'use strict';

module.exports = function(grunt) {
    require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks);
    require('load-grunt-tasks')(grunt);
    var webpack = require('webpack');
    var path = require('path');
    var ExtractTextPlugin = require('extract-text-webpack-plugin');

    var webpackSharedConfig = {
        entry: {
          'build/app': './app/scripts/main.js',
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    // This has effect on the react lib size
                    'NODE_ENV': JSON.stringify('production')
                }
            }),
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'window.jQuery': 'jquery'
            }),
            new webpack.optimize.DedupePlugin(),
            new ExtractTextPlugin('app.css')
        ],
        devtool: 'sourcemap',
        output: {
            path: './app/scripts',
            filename: '[name].js'
        },
        module: {
            loaders: [
              {
                test:   /\.scss/,
                loaders: ['style', 'css', 'sass'],
              },
              {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                loader: 'file?name=assets/fonts/webfonts/[name].[ext]'
              }
            ]
        },
        sassLoader: {
          sourceMap: true,
          sourceComments: false,
          outputStyle: 'expanded',
          includePaths: [
            path.resolve(__dirname, './node_modules/@salesforce-ux/design-system/scss'),
            path.resolve(__dirname, './node_modules/github-fork-ribbon-css')
          ]
        }
    };

    grunt.initConfig({
        webpack: {
            // options: webpackConfig,
            buildApp: webpackSharedConfig,
            buildLib: {
                entry: {
                  'dist/bootforce': './app/scripts/build.js'
                },
                plugins: [
                    new webpack.DefinePlugin({
                        'process.env': {
                            // This has effect on the react lib size
                            'NODE_ENV': JSON.stringify('production')
                        }
                    }),
                    new webpack.optimize.DedupePlugin()
                ],
                devtool: 'sourcemap',
                output: {
                    path: './app/scripts',
                    filename: '[name].js'
                }
            },
            distApp: {
                entry: {
                  'build/app': './app/scripts/main.js',
                },
                plugins: [
                    new webpack.DefinePlugin({
                        'process.env': {
                            // This has effect on the react lib size
                            'NODE_ENV': JSON.stringify('production')
                        }
                    }),
                    new webpack.ProvidePlugin({
                        $: 'jquery',
                        jQuery: 'jquery',
                        'window.jQuery': 'jquery'
                    }),
                    new webpack.optimize.DedupePlugin(),
                    new webpack.optimize.UglifyJsPlugin(),
                    new ExtractTextPlugin('./../styles/main.css')
                ],
                module: {
                    loaders: [
                        {
                            test: /\.scss$/,
                            loader: ExtractTextPlugin.extract(
                              'style',
                              'css!sass')
                        },
                        {
                            test: /\.(eot|svg|ttf|woff|woff2)$/,
                            loader: 'file?name=../assets/fonts/webfonts/[name].[ext]'
                        }
                    ]
                },
                output: {
                    path: './app/scripts',
                    filename: '[name].min.js'
                },
                sassLoader: {
                  sourceMap: true,
                  sourceComments: false,
                  outputStyle: 'expanded',
                  includePaths: [
                    path.resolve(__dirname, './node_modules/@salesforce-ux/design-system/scss'),
                    path.resolve(__dirname, './node_modules/github-fork-ribbon-css')
                  ]
                }
            },
            distLib: {
                entry: {
                  'dist/bootforce': './app/scripts/build.js'
                },
                plugins: [
                    new webpack.optimize.DedupePlugin(),
                    new webpack.optimize.UglifyJsPlugin()
                ],
                output: {
                    path: './app/scripts',
                    filename: '[name].min.js'
                }
            }
        },
        'webpack-dev-server': {
            options: {
                webpack: webpackSharedConfig,
                publicPath: '/' + webpackSharedConfig.output.publicPath
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
        watch: {
            files: ['app/sass/**/*.scss', 'app/tmpl/**/*.html'],
            tasks: ['preprocess', 'sassCompile', 'webpack-dev-server'],
            options: {
                spawn: false,
                livereload: true
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

    // grunt.registerTask('build', [
    //     'jshint',
    //     'env:prod',
    //     'preprocess:dev',
    //     'connect:deploy'
    // ]);

    // grunt.registerTask('default', [
    //     'env:dev',
    //     'preprocess:dev',
    //     'server',
    //     'watch'
    // ]);

        // The development server (the recommended option for development)
    grunt.registerTask('default', [
        'env:dev',
        'preprocess:dev',
        // 'sassCompile',
        'webpack:buildApp',
        'webpack:buildLib',
        'webpack-dev-server:start',
        // 'watch'
    ]);

    // Production build
    grunt.registerTask('build', [
        'jshint',
        'env:prod',
        'preprocess:dev',
        'sassCompile',
        'webpack:distApp',
        'webpack:distLib',
        'connect:deploy'
    ]);
};
