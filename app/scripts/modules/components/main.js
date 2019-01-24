/* global requirejs */
'use strict';
(function() {

    requirejs.config({
        baseUrl: 'scripts'
    });

    require([
        'modules/components/utils/transition',
        'modules/components/alert',
        'modules/components/tab',
        'modules/components/button',
        'modules/components/modal',
        'modules/components/tooltip',
        'modules/components/dropdown',
        'modules/components/popover',
        'modules/components/responsiveMenu'
    ], function() {
        // nothing to see here yet

    });
}());
