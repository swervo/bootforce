/* ========================================================================
 * Bootstrap: button.js v3.3.5
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

(function() {
    'use strict';
    require([], function() {

        // BUTTON PUBLIC CLASS DEFINITION
        // ==============================

        var Button = function(element, options) {
            this.$element = $(element);
            this.options = $.extend({}, Button.DEFAULTS, options);
            this.isLoading = false;
        };

        Button.VERSION = '3.3.5';

        Button.prototype.toggle = function() {
            var changed = true;
            var $parent = this.$element.closest('[data-toggle="buttons"]');

            if ($parent.length) {
                if ($parent.data('grouptype') === 'checkbox') {
                    console.log('checkbox');
                    if (this.$element.hasClass('slds-is-selected')) {
                        changed = false;
                    }
                    this.$element.toggleClass('slds-is-selected');
                } else {
                    // assume its radio type behaviour
                    if (this.$element.hasClass('slds-is-selected')) {
                        changed = false;
                    }
                    $parent.find('.slds-is-selected').removeClass('slds-is-selected');
                    this.$element.addClass('slds-is-selected');
                }
                if (changed) {
                    //this may not be required
                    this.$element.trigger('change');
                }
            } else {
                // just a regular button
                this.$element.attr('aria-pressed', !this.$element.hasClass('slds-is-selected'));
                this.$element.toggleClass('slds-is-selected');
            }
        };

        Button.prototype.changeState = function() {
            this.$element.attr('aria-pressed', !this.$element.hasClass('slds-is-selected'));
            this.$element.toggleClass('slds-is-selected slds-not-selected');
        };

        // BUTTON PLUGIN DEFINITION
        // ========================

        function Plugin(option) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('bs.button');
                var options = typeof option === 'object' && option;

                if (!data) {
                    $this.data('bs.button', (data = new Button(this, options)));
                }

                if (option === 'toggle') {
                    data.toggle();
                } else {
                    // this is changestate
                    data.changeState();
                }
            });
        }

        var old = $.fn.button;

        $.fn.button = Plugin;
        $.fn.button.Constructor = Button;

        // BUTTON NO CONFLICT
        // ==================

        $.fn.button.noConflict = function() {
            $.fn.button = old;
            return this;
        };

        // BUTTON DATA-API
        // ===============

        $(document)
            .on('click.bs.button.data-api', '[data-toggle^="button"]', function(e) {
                var $btn = $(e.target);
                if (!$btn.hasClass('slds-button')) {
                    $btn = $btn.closest('.slds-button');
                }
                if ($btn.data().buttontype) {
                    Plugin.call($btn, 'changestate');
                } else {
                    Plugin.call($btn, 'toggle');
                }
                // doesnt look like this applies for slds
                if (!($(e.target).is('input[type="radio"]') ||
                    $(e.target).is('input[type="checkbox"]'))) {
                    e.preventDefault();
                }
            })
            .on('focus.bs.button.data-api blur.bs.button.data-api',
                '[data-toggle^="button"]', function(e) {
                    $(e.target).closest('.slds-button')
                        .toggleClass('focus', /^focus(in)?$/.test(e.type));
            });

    });

}());
