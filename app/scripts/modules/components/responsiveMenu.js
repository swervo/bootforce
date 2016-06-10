/* global define */

define([
], function() {
    'use strict';
    var isOpen = false;
    var $ignBurger = $('#ignBurger');
    var $ignMenu = $('#ignMenu');
    var $ignMenuShade = $('#ignMenuShade');

    function toggleMenu() {
        var namespace = window.bootforce.prefix;
        if (isOpen) {
            isOpen = false;
            $ignMenu.removeClass(namespace + 'show');
            $ignMenuShade.removeClass('fadeUp');
            setTimeout(function() {
                $ignMenuShade.removeClass(namespace + 'show');
            }, 250);
        } else {
            isOpen = true;
            $ignMenu.addClass(namespace + 'show');
            $ignMenuShade.addClass(namespace + 'show');
            setTimeout(function() {
                $ignMenuShade.addClass('fadeUp');
            }, 0);
        }
    }

    $ignBurger.on('click', toggleMenu);

    return {
        // init: init
    };
});
