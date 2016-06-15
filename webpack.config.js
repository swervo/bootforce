var path = require('path');

module.exports = {
    alias: {
      'knockout': path.join(__dirname, 'node_modules/knockout/build/output/knockout-latest.js'),
      'jquery': path.join(__dirname, 'node_modules/jquery/jquery.min.js'),
      'jsforce': path.join(__dirname, 'node_modules/jsforce/build/jsforce.min.js'),
      'modules': path.join(__dirname, 'app/scripts/modules'),
      'routes': path.join(__dirname, 'src/scripts/routes'),
      'components': path.join(__dirname, 'src/scripts/components'),
      'scripts': path.join(__dirname, 'src/scripts'),
      'styles': path.join(__dirname, 'src/styles')
    },
    entry: './app/scripts/main.js',
    output: {
        path: path.join(__dirname, 'app/scripts'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: 'style!css' }
        ]
    }
};
