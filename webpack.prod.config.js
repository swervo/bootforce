'use strict';

var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {

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
    }
};

