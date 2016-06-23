'use strict';

var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: {
      app: ['./app/scripts/main.js']
    },
    output: {
      path: path.resolve(__dirname, 'app/scripts/build'),
      publicPath: 'app/scripts/build',
      filename: 'bundle.js'
    },
    devtool: 'source-map',
    devServer: {
      stats: 'errors-only',
    },
    plugins: [
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
            loaders: ['style', 'css', 'sass']
          },
          {
            test: /\.(eot|svg|ttf|woff|woff2)$/,
            loader: 'file?name=../assets/fonts/webfonts/[name].[ext]'
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

