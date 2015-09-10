/* global requirejs */

(function () {
    'use strict';

    requirejs.config({
        baseUrl: 'scripts',
        paths: {
            jquery: '../lib/jquery/dist/jquery',
            knockout: '../lib/knockout/dist/knockout'
        },
        shim: {
        }
    });
 
    require([
        'jquery',
        'knockout'
    ], function ($, ko) {
        console.log('loaded');
        console.log($);
        console.log(ko);

    });
}());
