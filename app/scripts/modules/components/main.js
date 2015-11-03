/* global requirejs */

(function() {
    'use strict';

    requirejs.config({
        baseUrl: 'scripts',
        paths: {
            jquery: '../lib/jquery/dist/jquery'
        }
    });

    require([
        'modules/components/utils/transition',
        'modules/components/alert',
        'modules/components/tab',
        'modules/components/button',
        'modules/components/modal',
        'modules/components/tooltip',
        'modules/components/dropdown',
        'modules/components/popover'
    ], function() {
        // nothing to see here yet

    });
}());
