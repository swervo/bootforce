'use strict';

var path = require('path');
var webpack = require('webpack');

var PROD = (process.env.NODE_ENV);

module.exports = {
    alias: {
      'modules': path.join(__dirname, 'app/scripts/modules'),
      'routes': path.join(__dirname, 'src/scripts/routes'),
      'components': path.join(__dirname, 'src/scripts/components'),
      'scripts': path.join(__dirname, 'src/scripts'),
      'styles': path.join(__dirname, 'src/styles')
    },
    entry: {
      'build/app': './app/scripts/main.js',
      'dist/bootforce': './app/scripts/build.js'
    },
    output: {
        path: './app/scripts',
        filename: PROD ? '[name].min.js' : '[name].js'
    },
    devtool: 'source-map',
    plugins: PROD ? [
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: false,
        mangle: false
      })
    ] : [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery'
      })
    ],
    module: {
        loaders: [
            {
              test:   /\.scss/,
              loader: 'css!sass',
              // Or
              loaders: ['css', 'sass'],
          },
        ]
    },
    sassLoader: {
      sourceMap: true,
      sourceComments: false,
      outputStyle: 'expanded'
    }
};

