'use strict';

var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

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
        filename: '[name].js'
    },
    devtool: 'source-map',
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery'
      }),
      new ExtractTextPlugin('./../styles/hereIam.css')
    ],
    module: {
        loaders: [
          // {
          //   test:   /\.scss/,
          //   loaders: ['style', 'css', 'sass'],
          // },
          {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract(
              'style',
              'css!sass')
           },
          {
            test: /\.(eot|svg|ttf|woff|woff2)$/,
            loader: 'file?name=public/fonts/[name].[ext]'
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

