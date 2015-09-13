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
        'knockout',
        'modules/tab'
    ], function ($, ko, tab) {
        console.log($);
        console.log(ko);
        console.log(tab);

    });
}());
