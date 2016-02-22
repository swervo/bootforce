/* ========================================================================
 * Bootstrap: popover.js v3.3.5
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

(function() {
    'use strict';

    require([], function() {

        // POPOVER PUBLIC CLASS DEFINITION
        // ===============================

        var Popover = function(element, options) {
            this.init('popover', element, options);
        };

        if (!$.fn.tooltip) {
            throw new Error('Popover requires tooltip.js');
        }

        Popover.VERSION = '3.3.5';

        Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
            placement: 'right',
            trigger: 'click',
            content: '',
            template: '<div class="slds-popover slds-nubbin--left" role="dialog">'
                + '<div class="slds-popover__header"></div>'
                + '<div class="slds-popover__body"></div>'
                + '</div>'
        });


        // NOTE: POPOVER EXTENDS tooltip.js
        // ================================
        Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype);

        Popover.prototype.constructor = Popover;

        Popover.prototype.getDefaults = function() {
            return Popover.DEFAULTS;
        };

        Popover.prototype.setContent = function() {
            var $tip = this.tip();
            var title = this.getTitle();
            var content = this.getContent();

            $tip.find('.slds-popover__header')[this.options.html ? 'html' : 'text'](title);
            // we use append for html objects to maintain js events
            $tip.find('.slds-popover__body').children().detach().end()[
                this.options.html ? (typeof content === 'string' ? 'html' : 'append') : 'text'
            ](content);

            $tip.removeClass('fade top bottom left right in');

            // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
            // this manually by checking the contents.
            if (!$tip.find('.slds-popover__header').html()) {
                $tip.find('.slds-popover__header').hide();
            }
        };

        Popover.prototype.hasContent = function() {
            return this.getTitle() || this.getContent();
        };

        Popover.prototype.getContent = function() {
            var $e = this.$element;
            var o = this.options;

            return $e.attr('data-content') || (typeof o.content === 'function' ?
                o.content.call($e[0]) :
                o.content);
        };

        Popover.prototype.arrow = function() {
            return (this.$arrow = this.$arrow || this.tip().find('.arrow'));
        };


        // POPOVER PLUGIN DEFINITION
        // =========================

        function Plugin(option) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('bs.popover');
                var options = typeof option === 'object' && option;

                if (!data && /destroy|hide/.test(option)) {
                    return;
                }
                if (!data) {
                    $this.data('bs.popover', (data = new Popover(this, options)));
                }
                if (typeof option === 'string') {
                    data[option]();
                }
            });
        }

        var old = $.fn.popover;

        $.fn.popover = Plugin;
        $.fn.popover.Constructor = Popover;

        // Enable all popovers
        $('[data-toggle="popover"]').popover();


        // POPOVER NO CONFLICT
        // ===================

        $.fn.popover.noConflict = function() {
            $.fn.popover = old;
            return this;
        };

    });

}());
