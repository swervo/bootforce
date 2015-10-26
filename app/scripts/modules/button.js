/* ========================================================================
 * Bootstrap: button.js v3.3.5
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

(function() {
    'use strict';
    require([
        'jquery'
    ], function($) {

        // BUTTON PUBLIC CLASS DEFINITION
        // ==============================

        var Button = function(element, options) {
            this.$element = $(element);
            this.options = $.extend({}, Button.DEFAULTS, options);
            this.isLoading = false;
        };

        Button.VERSION = '3.3.5';

        Button.DEFAULTS = {
            loadingText: 'loading...'
        };

        Button.prototype.setState = function(state) {
            var d = 'disabled';
            var $el = this.$element;
            var val = $el.is('input') ? 'val' : 'html';
            var data = $el.data();

            state += 'Text';

            if (data.resetText === null) {
                $el.data('resetText', $el[val]());
            }

            // push to event loop to allow forms to submit
            setTimeout($.proxy(function() {
                $el[val](data[state] === null ? this.options[state] : data[state]);

                if (state === 'loadingText') {
                    this.isLoading = true;
                    $el.addClass(d).attr(d, d);
                } else if (this.isLoading) {
                    this.isLoading = false;
                    $el.removeClass(d).removeAttr(d);
                }
            }, this), 0);
        };

        Button.prototype.toggle = function() {
            var changed = true;
            var $parent = this.$element.closest('[data-toggle="buttons"]');

            if ($parent.length) {
                if ($parent.data('grouptype') === 'checkbox') {
                    console.log('checkbox');
                    if (this.$element.hasClass('active')) {
                        changed = false;
                    }
                    this.$element.toggleClass('active');
                } else {
                    // assume its radio type behaviour
                    if (this.$element.hasClass('active')) {
                        changed = false;
                    }
                    $parent.find('.active').removeClass('active');
                    this.$element.addClass('active');
                }
                if (changed) {
                    //this may not be required
                    this.$element.trigger('change');
                }
            } else {
                this.$element.attr('aria-pressed', !this.$element.hasClass('active'));
                this.$element.toggleClass('active');
            }
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
                } else if (option) {
                    data.setState(option);
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
                Plugin.call($btn, 'toggle');
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
