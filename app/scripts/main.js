/* global requirejs */

(function() {
    'use strict';

    requirejs.config({
        baseUrl: 'scripts',
        paths: {
            jquery: '../lib/jquery/dist/jquery',
            knockout: '../lib/knockout/dist/knockout',
            jsforce: '../lib/jsforce/build/jsforce'
        },
        shim: {}
    });

    require([
        'jquery',
        'knockout',
        'utils/transition',
        'modules/login/main',
        'modules/components/main'
    ], function() {
        // put initialisation stuff here


    });
}());
