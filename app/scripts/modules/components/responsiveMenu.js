/* global define */

define([
], function() {
    'use strict';
    var isOpen = false;
    var $bfBurger = $('#bfBurger');
    var $bfMenu = $('#bfMenu');
    var $bfMenuShade = $('#bfMenuShade');

    function toggleMenu() {
        var namespace = window.bootforce.prefix;
        if (isOpen) {
            isOpen = false;
            $bfMenu.removeClass(namespace + 'show');
            $bfMenuShade.removeClass('fadeUp');
            setTimeout(function() {
                $bfMenuShade.removeClass(namespace + 'show');
            }, 250);
        } else {
            isOpen = true;
            $bfMenu.addClass(namespace + 'show');
            $bfMenuShade.addClass(namespace + 'show');
            setTimeout(function() {
                $bfMenuShade.addClass('fadeUp');
            }, 0);
        }
    }

    $bfBurger.on('click', toggleMenu);

    return {
        // init: init
    };
});
