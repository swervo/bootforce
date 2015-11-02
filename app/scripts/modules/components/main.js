/* global requirejs */

(function() {
    'use strict';

    requirejs.config({
        baseUrl: 'scripts',
        paths: {
            jquery: '../lib/jquery/dist/jquery',
            knockout: '../lib/knockout/dist/knockout',
            jsforce: '../lib/jsforce/build/jsforce'
        }
    });

    require([
        'modules/components/utils/transition',
        'modules/components/alert',
        'modules/components/tab',
        'modules/components/button',
        'modules/components/modal',
        'modules/components/tooltip',
        'modules/components/dropdown'
    ], function() {
        // nothing to see here yet

    });
}());
