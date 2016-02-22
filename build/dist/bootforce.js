/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                //Lop off the last part of baseParts, so that . matches the
                //"directory" and not name of the baseName's module. For instance,
                //baseName of "one/two/three", maps to "one/two/three.js", but we
                //want the directory, "one/two" for this normalization.
                name = baseParts.slice(0, baseParts.length - 1).concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../lib/almond/almond", function(){});

/* ========================================================================
 * Bootstrap: transition.js v3.3.5
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


(function() {
    'use strict';
    require([], function() {

        // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
        // ============================================================
        function transitionEnd() {
            var el = document.createElement('bootstrap');

            var transEndEventNames = {
                WebkitTransition: 'webkitTransitionEnd',
                MozTransition: 'transitionend',
                OTransition: 'oTransitionEnd otransitionend',
                transition: 'transitionend'
            };

            for (var name in transEndEventNames) {
                if (el.style[name] !== undefined) {
                    return {
                        end: transEndEventNames[name]
                    };
                }
            }

            return false; // explicit for ie8 (  ._.)
        }

        // http://blog.alexmaccaw.com/css-transitions
        $.fn.emulateTransitionEnd = function(duration) {
            var called = false;
            var $el = this;
            $(this).one('bsTransitionEnd', function() {
                called = true;
            });
            var callback = function() {
                if (!called) {
                    $($el).trigger($.support.transition.end);
                }
            };
            setTimeout(callback, duration);
            return this;
        };

        $(function() {
            $.support.transition = transitionEnd();

            if (!$.support.transition) {
                return;
            }

            $.event.special.bsTransitionEnd = {
                bindType: $.support.transition.end,
                delegateType: $.support.transition.end,
                handle: function(e) {
                    if ($(e.target).is(this)) {
                        return e.handleObj.handler.apply(this, arguments);
                    }
                }
            };
        });

    });

}());

define("modules/components/utils/transition", function(){});

/* ========================================================================
 * Bootstrap: alert.js v3.3.5
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

(function() {
    'use strict';
    require([], function() {

        // ALERT CLASS DEFINITION
        // ======================

        var dismiss = '[data-dismiss="alert"]';
        var Alert = function(el) {
            $(el).on('click', dismiss, this.close);
        };

        Alert.VERSION = '3.3.5';

        Alert.TRANSITION_DURATION = 150;

        Alert.prototype.close = function(e) {
            var $this = $(this);
            var selector = $this.attr('data-target');

            if (!selector) {
                selector = $this.attr('href');
            }

            var $parent = $(selector);

            if (e) {
                e.preventDefault();
            }

            if (!$parent.length) {
                $parent = $this.closest('.slds-notify--alert');
            }

            $parent.trigger(e = $.Event('close.bs.alert'));

            if (e.isDefaultPrevented()) {
                return;
            }

            $parent.removeClass('in');

            function removeElement() {
                // detach from parent, fire event then clean up data
                $parent.detach().trigger('closed.bs.alert').remove();
            }

            $.support.transition && $parent.hasClass('fade') ?
                $parent
                .one('bsTransitionEnd', removeElement)
                .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
                removeElement();
        };


        // ALERT PLUGIN DEFINITION
        // =======================

        function Plugin(option) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('bs.alert');

                if (!data) {
                    $this.data('bs.alert', (data = new Alert(this)));
                }
                if (typeof option === 'string') {
                    data[option].call($this);
                }
            });
        }

        var old = $.fn.alert;

        $.fn.alert = Plugin;
        $.fn.alert.Constructor = Alert;


        // ALERT NO CONFLICT
        // =================

        $.fn.alert.noConflict = function() {
            $.fn.alert = old;
            return this;
        };


        // ALERT DATA-API
        // ==============

        $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close);

    });

}());

define("modules/components/alert", function(){});

/* ========================================================================
 * Bootstrap: tab.js v3.3.5
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

(function() {
    'use strict';

    require([], function() {

        var Tab = function(element) {
            // jscs:disable requireDollarBeforejQueryAssignment
            this.element = $(element);
            // jscs:enable requireDollarBeforejQueryAssignment
        };

        Tab.VERSION = '3.3.5';

        Tab.TRANSITION_DURATION = 150;

        Tab.prototype.show = function() {
            var $this = this.element;
            var $ul = $this.closest('ul:not(.dropdown-menu)');
            var selector = $this.data('target');

            if (!selector) {
                selector = $this.attr('href');
                selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
            }

            if ($this.parent('li').hasClass('slds-active')) {
                return;
            }

            var $previous = $ul.find('.slds-active:last a');
            var hideEvent = $.Event('hide.bs.tab', {
                relatedTarget: $this[0]
            });
            var showEvent = $.Event('show.bs.tab', {
                relatedTarget: $previous[0]
            });

            $previous.trigger(hideEvent);
            $this.trigger(showEvent);

            if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) {
                return;
            }
            var $target = $(selector);

            this.activate($this.closest('li'), $ul);
            this.activate($target, $target.parent(), function() {
                $previous.trigger({
                    type: 'hidden.bs.tab',
                    relatedTarget: $this[0]
                });
                $this.trigger({
                    type: 'shown.bs.tab',
                    relatedTarget: $previous[0]
                });
            });
        };

        Tab.prototype.activate = function(element, container, callback) {
            var activeSuffix = 'active';
            if (callback) {
                // this is the toggle content call
                activeSuffix = 'show';
            }
            var $active = container.find('> .slds-' + activeSuffix);
            var transition = callback && $.support.transition &&
                ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length);

            function next() {
                $active
                    .removeClass('slds-' + activeSuffix)
                    .find('> .dropdown-menu > .slds-' + activeSuffix)
                    .removeClass('slds-' + activeSuffix)
                    .end()
                    .find('[data-toggle="tab"]')
                    .attr('aria-expanded', false);


                element
                    .addClass('slds-' + activeSuffix)
                    .find('[data-toggle="tab"]')
                    .attr('aria-expanded', true);


                if (transition) {
                    element[0].offsetWidth; // reflow for transition
                    element.addClass('in');
                } else {
                    element.removeClass('fade');
                }

                if (element.parent('.dropdown-menu').length) {
                    element
                        .closest('li.dropdown')
                        .addClass('slds-' + activeSuffix)
                        .end()
                        .find('[data-toggle="tab"]')
                        .attr('aria-expanded', true);
                }

                callback && callback();
            }

            $active.length && transition ?
                $active
                .one('bsTransitionEnd', next)
                .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
                next();

            $active.removeClass('in');
        };


        // TAB PLUGIN DEFINITION
        // =====================

        function Plugin(option) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('bs.tab');

                if (!data) {
                    $this.data('bs.tab', (data = new Tab(this)));
                }
                if (typeof option === 'string') {
                    data[option]();
                }
            });
        }

        var old = $.fn.tab;

        $.fn.tab = Plugin;
        $.fn.tab.Constructor = Tab;


        // TAB NO CONFLICT
        // ===============

        $.fn.tab.noConflict = function() {
            $.fn.tab = old;
            return this;
        };


        // TAB DATA-API
        // ============

        var clickHandler = function(e) {
            e.preventDefault();
            Plugin.call($(this), 'show');
        };

        $(document)
            .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
            .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler);

    });

}());

define("modules/components/tab", function(){});

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

define("modules/components/button", function(){});

/* ========================================================================
 * Bootstrap: modal.js v3.3.5
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


(function() {
    'use strict';
    require([], function() {

        // MODAL CLASS DEFINITION
        // ======================

        var Modal = function(element, options) {
            this.options = options;
            this.$body = $(document.body);
            this.$element = $(element);
            this.$element.attr('tabindex', -1);
            this.$element.attr('style', 'display: none');
            this.$dialog = this.$element.find('.slds-modal__container');
            this.$backdrop = null;
            this.isShown = null;
            this.originalBodyPad = null;
            this.scrollbarWidth = 0;
            this.ignoreBackdropClick = false;
        };

        Modal.VERSION = '3.3.5';

        Modal.TRANSITION_DURATION = 300;
        Modal.BACKDROP_TRANSITION_DURATION = 150;

        Modal.DEFAULTS = {
            backdrop: true,
            keyboard: true,
            show: true
        };

        Modal.prototype.toggle = function(_relatedTarget) {
            return this.isShown ? this.hide() : this.show(_relatedTarget);
        };

        Modal.prototype.show = function(_relatedTarget) {
            var that = this;
            var e = $.Event('show.bs.modal', {
                relatedTarget: _relatedTarget
            });

            this.$element.trigger(e);

            if (this.isShown || e.isDefaultPrevented()) {
                return;
            }

            this.isShown = true;

            this.checkScrollbar();
            this.setScrollbar();
            this.$body.addClass('modal-open');

            this.escape();
            this.resize();

            this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this));

            this.$dialog.on('mousedown.dismiss.bs.modal', function() {
                that.$element.one('mouseup.dismiss.bs.modal', function(e) {
                    if ($(e.target).is(that.$element)) {
                        that.ignoreBackdropClick = true;
                    }
                });
            });


            this.backdrop(function() {
                var transition = $.support.transition && that.$element.hasClass('fade');

                if (!that.$element.parent().length) {
                    that.$element.appendTo(that.$body); // don't move modals dom position
                }

                that.$element
                    .show()
                    .scrollTop(0);

                that.adjustDialog();

                if (transition) {
                    that.$element[0].offsetWidth; // force reflow
                }

                that.$element.addClass('slds-fade-in-open');

                that.enforceFocus();

                var e = $.Event('shown.bs.modal', {
                    relatedTarget: _relatedTarget
                });

                transition ?
                    that.$dialog // wait for modal to slide in
                    .one('bsTransitionEnd', function() {
                        that.$element.trigger('focus').trigger(e);
                    })
                    .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
                    that.$element.trigger('focus').trigger(e);
            });
        };

        Modal.prototype.hide = function(e) {
            if (e) {
                e.preventDefault();
            }

            e = $.Event('hide.bs.modal');

            this.$element.trigger(e);
            if (!this.isShown || e.isDefaultPrevented()) {
                return;
            }

            this.isShown = false;

            this.escape();
            this.resize();

            $(document).off('focusin.bs.modal');

            this.$element
                .removeClass('slds-fade-in-open')
                .off('click.dismiss.bs.modal')
                .off('mouseup.dismiss.bs.modal');

            this.$dialog.off('mousedown.dismiss.bs.modal');

            $.support.transition && this.$element.hasClass('fade') ?
                this.$element
                    .one('bsTransitionEnd', $.proxy(this.hideModal, this))
                    .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
                    this.hideModal();
        };

        Modal.prototype.enforceFocus = function() {
            $(document)
                .off('focusin.bs.modal') // guard against infinite focus loop
                .on('focusin.bs.modal', $.proxy(function(e) {
                    if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                        this.$element.trigger('focus');
                    }
                }, this));
        };

        Modal.prototype.escape = function() {
            if (this.isShown && this.options.keyboard) {
                this.$element.on('keydown.dismiss.bs.modal', $.proxy(function(e) {
                    e.which === 27 && this.hide();
                }, this));
            } else if (!this.isShown) {
                this.$element.off('keydown.dismiss.bs.modal');
            }
        };

        Modal.prototype.resize = function() {
            if (this.isShown) {
                $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this));
            } else {
                $(window).off('resize.bs.modal');
            }
        };

        Modal.prototype.hideModal = function() {
            var that = this;
            this.$element.hide();
            this.backdrop(function() {
                that.$body.removeClass('modal-open');
                that.resetAdjustments();
                that.resetScrollbar();
                that.$element.trigger('hidden.bs.modal');
            });
        };

        Modal.prototype.removeBackdrop = function() {
            this.$backdrop && this.$backdrop.remove();
            this.$backdrop = null;
        };

        Modal.prototype.backdrop = function(callback) {
            var that = this;
            var animate = this.$element.hasClass('fade') ? 'fade' : '';

            if (this.isShown && this.options.backdrop) {
                var doAnimate = $.support.transition && animate;

                // this.$backdrop = $('#slds-modal-backdrop');
                this.$backdrop = $(document.createElement('div'))
                    .addClass('slds-modal-backdrop')
                    .appendTo(this.$body);
                setTimeout(function(aScope) {
                    aScope.$backdrop.addClass('slds-modal-backdrop--open');
                }, 0, this);
                // this.$backdrop = $(document.createElement('div'))
                //     .addClass('modal-backdrop ' + animate)
                //     .appendTo(this.$body);

                this.$element.on('click.dismiss.bs.modal', $.proxy(function(e) {
                    if (this.ignoreBackdropClick) {
                        this.ignoreBackdropClick = false;
                        return;
                    }
                    if (e.target !== e.currentTarget) {
                        return;
                    }
                    this.options.backdrop === 'static' ? this.$element[0].focus() : this.hide();
                }, this));

                if (doAnimate) {
                    this.$backdrop[0].offsetWidth; // force reflow
                }

                if (!callback) {
                    return;
                }

                doAnimate ?
                    this.$backdrop
                    .one('bsTransitionEnd', callback)
                    .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
                    callback();

            } else if (!this.isShown && this.$backdrop) {
                this.$backdrop.removeClass('slds-modal-backdrop--open');

                var callbackRemove = function() {
                    that.removeBackdrop();
                    callback && callback();
                };
                this.$backdrop
                    .one('bsTransitionEnd', callbackRemove)
                    .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION);
                // $.support.transition && this.$element.hasClass('fade') ?
                //     this.$backdrop
                //     .one('bsTransitionEnd', callbackRemove)
                //     .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
                //     callbackRemove();

            } else if (callback) {
                callback();
            }
        };

        // these following methods are used to handle overflowing modals

        Modal.prototype.handleUpdate = function() {
            this.adjustDialog();
        };

        Modal.prototype.adjustDialog = function() {
            var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight;

            this.$element.css({
                paddingLeft: !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
                paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
            });
        };

        Modal.prototype.resetAdjustments = function() {
            this.$element.css({
                paddingLeft: '',
                paddingRight: ''
            });
        };

        Modal.prototype.checkScrollbar = function() {
            var fullWindowWidth = window.innerWidth;
            if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
                var documentElementRect = document.documentElement.getBoundingClientRect();
                fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
            }
            this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth;
            this.scrollbarWidth = this.measureScrollbar();
        };

        Modal.prototype.setScrollbar = function() {
            var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10);
            this.originalBodyPad = document.body.style.paddingRight || '';
            if (this.bodyIsOverflowing) {
                this.$body.css('padding-right', bodyPad + this.scrollbarWidth);
            }
        };

        Modal.prototype.resetScrollbar = function() {
            this.$body.css('padding-right', this.originalBodyPad);
        };

        Modal.prototype.measureScrollbar = function() { // thx walsh
            var scrollDiv = document.createElement('div');
            scrollDiv.className = 'modal-scrollbar-measure';
            this.$body.append(scrollDiv);
            var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
            this.$body[0].removeChild(scrollDiv);
            return scrollbarWidth;
        };


        // MODAL PLUGIN DEFINITION
        // =======================

        function Plugin(option, _relatedTarget) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('bs.modal');
                var options = $.extend({}, Modal.DEFAULTS,
                    $this.data(), typeof option === 'object' && option);

                if (!data) {
                    $this.data('bs.modal', (data = new Modal(this, options)));
                }
                if (typeof option === 'string') {
                    data[option](_relatedTarget);
                } else if (options.show) {
                    data.show(_relatedTarget);
                }
            });
        }

        var old = $.fn.modal;

        $.fn.modal = Plugin;
        $.fn.modal.Constructor = Modal;


        // MODAL NO CONFLICT
        // =================

        $.fn.modal.noConflict = function() {
            $.fn.modal = old;
            return this;
        };


        // MODAL DATA-API
        // ==============

        $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function(e) {
            var $this = $(this);
            var href = $this.attr('href');
            // strip for ie7
            var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, '')));
            var option = $target.data('bs.modal') ? 'toggle' : $.extend({
                remote: !/#/.test(href) && href
            }, $target.data(), $this.data());

            if ($this.is('a')) {
                e.preventDefault();
            }

            $target.one('show.bs.modal', function(showEvent) {
                if (showEvent.isDefaultPrevented()) {
                    return; // only register focus restorer if modal will actually get shown
                }
                $target.one('hidden.bs.modal', function() {
                    $this.is(':visible') && $this.trigger('focus');
                });
            });
            Plugin.call($target, option, this);
        });
    });

}());

define("modules/components/modal", function(){});

/* ========================================================================
 * Bootstrap: tooltip.js v3.3.5
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

(function() {
    'use strict';

    require([], function() {

        // TOOLTIP PUBLIC CLASS DEFINITION
        // ===============================
        var Tooltip = function(element, options) {
            this.type = null;
            this.options = null;
            this.enabled = null;
            this.timeout = null;
            this.hoverState = null;
            this.$element = null;
            this.inState = null;

            this.init('tooltip', element, options);
        };

        Tooltip.VERSION = '3.3.5';

        Tooltip.TRANSITION_DURATION = 150;

        Tooltip.DEFAULTS = {
            animation: true,
            placement: 'right',
            selector: false,
            template: '<div class="slds-tooltip" role="tooltip">'
                        + '<div class="slds-tooltip__content">'
                        + '<div class="slds-tooltip__body">This is some body content'
                        + '</div></div></div>',
            trigger: 'hover focus',
            title: '',
            delay: 500,
            html: false,
            container: false,
            viewport: {
                selector: 'body',
                padding: 0
            }
        };


        Tooltip.prototype.init = function(type, element, options) {
            this.enabled = true;
            this.type = type;
            this.$element = $(element);
            this.options = this.getOptions(options);
            this.$viewport = this.options.viewport
                && $($.isFunction(this.options.viewport)
                    ? this.options.viewport.call(this, this.$element)
                    : (this.options.viewport.selector || this.options.viewport));
            this.inState = {
                click: false,
                hover: false,
                focus: false
            };

            if (this.$element[0] instanceof document.constructor && !this.options.selector) {
                throw new Error(
                    '`selector` option must be specified when initializing '
                        + this.type + ' on the window.document object!'
                    );
            }

            var triggers = this.options.trigger.split(' ');

            for (var i = triggers.length; i--;) {
                var trigger = triggers[i];

                if (trigger === 'click') {
                    this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
                } else if (trigger !== 'manual') {
                    var eventIn = trigger === 'hover' ? 'mouseenter' : 'focusin';
                    var eventOut = trigger === 'hover' ? 'mouseleave' : 'focusout';

                    this.$element.on(
                        eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this)
                    );
                    this.$element.on(
                        eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this)
                    );
                }
            }

            this.options.selector ?
                (this._options = $.extend({}, this.options, {
                    trigger: 'manual',
                    selector: ''
                })) :
                this.fixTitle();
        };

        Tooltip.prototype.SLDSPOSCLASSES = {
            'top': 'slds-nubbin--bottom',
            'right': 'slds-nubbin--left',
            'bottom': 'slds-nubbin--top',
            'left': 'slds-nubbin--right'
        };
        
        Tooltip.prototype.getDefaults = function() {
            return Tooltip.DEFAULTS;
        };

        Tooltip.prototype.getOptions = function(options) {
            options = $.extend({}, this.getDefaults(), this.$element.data(), options);

            if (options.delay && typeof options.delay === 'number') {
                options.delay = {
                    show: options.delay,
                    hide: options.delay
                };
            }

            return options;
        };

        Tooltip.prototype.getDelegateOptions = function() {
            var options = {};
            var defaults = this.getDefaults();

            this._options && $.each(this._options, function(key, value) {
                if (defaults[key] !== value) {
                    options[key] = value;
                }
            });

            return options;
        };

        Tooltip.prototype.enter = function(obj) {
            var self = obj instanceof this.constructor ?
                obj : $(obj.currentTarget).data('bs.' + this.type);

            if (!self) {
                self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
                $(obj.currentTarget).data('bs.' + this.type, self);
            }

            if (obj instanceof $.Event) {
                self.inState[obj.type === 'focusin' ? 'focus' : 'hover'] = true;
            }

            if (self.tip().hasClass('in') || self.hoverState === 'in') {
                self.hoverState = 'in';
                return;
            }

            clearTimeout(self.timeout);

            self.hoverState = 'in';

            if (!self.options.delay || !self.options.delay.show) {
                return self.show();
            }

            self.timeout = setTimeout(function() {
                if (self.hoverState === 'in') {
                    self.show();
                }
            }, self.options.delay.show);
        };

        Tooltip.prototype.isInStateTrue = function() {
            for (var key in this.inState) {
                if (this.inState[key]) {
                    return true;
                }
            }

            return false;
        };

        Tooltip.prototype.leave = function(obj) {
            var self = obj instanceof this.constructor ?
                obj : $(obj.currentTarget).data('bs.' + this.type);

            if (!self) {
                self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
                $(obj.currentTarget).data('bs.' + this.type, self);
            }

            if (obj instanceof $.Event) {
                self.inState[obj.type === 'focusout' ? 'focus' : 'hover'] = false;
            }

            if (self.isInStateTrue()) {
                return;
            }
            clearTimeout(self.timeout);

            self.hoverState = 'out';

            if (!self.options.delay || !self.options.delay.hide) {
                return self.hide();
            }

            self.timeout = setTimeout(function() {
                if (self.hoverState === 'out') {
                    self.hide();
                }
            }, self.options.delay.hide);
        };

        Tooltip.prototype.show = function() {
            var e = $.Event('show.bs.' + this.type);
            if (this.hasContent() && this.enabled) {
                this.$element.trigger(e);

                var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0]);
                if (e.isDefaultPrevented() || !inDom) {
                    return;
                }
                var that = this;

                var $tip = this.tip();

                var tipId = this.getUID(this.type);

                this.setContent();
                $tip.attr('id', tipId);
                this.$element.attr('aria-describedby', tipId);

                if (this.options.animation) {
                    $tip.addClass('fade');
                }

                var placement = typeof this.options.placement === 'function' ?
                    this.options.placement.call(this, $tip[0], this.$element[0]) :
                    this.options.placement;

                var autoToken = /\s?auto?\s?/i;
                var autoPlace = autoToken.test(placement);
                if (autoPlace) {
                    placement = placement.replace(autoToken, '') || 'top';
                }

                $tip
                    .detach()
                    .css({
                        top: 0,
                        left: 0,
                        display: 'block'
                    })
                    .addClass(this.getSLDSNubbinClass(placement))
                    .data('bs.' + this.type, this);

                this.options.container ?
                    $tip.appendTo(this.options.container) :
                    $tip.insertAfter(this.$element);
                this.$element.trigger('inserted.bs.' + this.type);

                var pos = this.getPosition();
                var actualWidth = $tip[0].offsetWidth;
                var actualHeight = $tip[0].offsetHeight;

                if (autoPlace) {
                    var orgPlacement = placement;
                    var viewportDim = this.getPosition(this.$viewport);

                    placement = placement === 'bottom' && (pos.bottom + actualHeight > viewportDim.bottom)
                        ? 'top' :
                        placement === 'top' && (pos.top - actualHeight < viewportDim.top) ? 'bottom' :
                        placement === 'right' && (pos.right + actualWidth > viewportDim.width) ? 'left' :
                        placement === 'left' && (pos.left - actualWidth < viewportDim.left) ? 'right' :
                        placement;

                    $tip
                        .removeClass(orgPlacement)
                        .addClass(placement);
                }

                var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

                this.applyPlacement(calculatedOffset, placement);

                var complete = function() {
                    var prevHoverState = that.hoverState;
                    that.$element.trigger('shown.bs.' + that.type);
                    that.hoverState = null;

                    if (prevHoverState === 'out') {
                        that.leave(that);
                    }
                };

                $.support.transition && this.$tip.hasClass('fade') ?
                    $tip
                    .one('bsTransitionEnd', complete)
                    .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
                    complete();
            }
        };

        Tooltip.prototype.applyPlacement = function(offset, placement) {
            var $tip = this.tip();
            var width = $tip[0].offsetWidth;
            var height = $tip[0].offsetHeight;

            // manually read margins because getBoundingClientRect includes difference
            var marginTop = parseInt($tip.css('margin-top'), 10);
            var marginLeft = parseInt($tip.css('margin-left'), 10);

            // we must check for NaN for ie 8/9
            if (isNaN(marginTop)) {
                marginTop = 0;
            }
            if (isNaN(marginLeft)) {
                marginLeft = 0;
            }

            offset.top += marginTop;
            offset.left += marginLeft;

            // $.fn.offset doesn't round pixel values
            // so we use setOffset directly with our own function B-0
            $.offset.setOffset($tip[0], $.extend({
                using: function(props) {
                    $tip.css({
                        top: Math.round(props.top),
                        left: Math.round(props.left)
                    });
                }
            }, offset), 0);

            $tip.addClass('in');

            // check to see if placing tip in new offset caused the tip to resize itself
            var actualWidth = $tip[0].offsetWidth;
            var actualHeight = $tip[0].offsetHeight;

            if (placement === 'top' && actualHeight !== height) {
                offset.top = offset.top + height - actualHeight;
            }

            var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight);

            if (delta.left) {
                offset.left += delta.left;
            } else {
                offset.top += delta.top;
            }

            var isVertical = /top|bottom/.test(placement);
            var arrowDelta = isVertical ?
                delta.left * 2 - width + actualWidth :
                delta.top * 2 - height + actualHeight;
            var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight';

            $tip.offset(offset);
            this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical);
        };

        Tooltip.prototype.replaceArrow = function(delta, dimension, isVertical) {
            this.arrow()
                .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
                .css(isVertical ? 'top' : 'left', '');
        };

        Tooltip.prototype.setContent = function() {
            var $tip = this.tip();
            var title = this.getTitle();
            $tip.find('.slds-tooltip__body')[this.options.html ? 'html' : 'text'](title);
            $tip.removeClass('fade in top bottom left right');
        };

        Tooltip.prototype.hide = function(callback) {

            var that = this;
            var $tip = $(this.$tip);
            var e = $.Event('hide.bs.' + this.type);

            function complete() {
                if (that.hoverState !== 'in') {
                    // detach tip here;
                    $tip.detach();
                }
                that.$element
                    .removeAttr('aria-describedby')
                    .trigger('hidden.bs.' + that.type);
                callback && callback();
            }

            this.$element.trigger(e);

            if (e.isDefaultPrevented()) {
                return;
            }

            $tip.removeClass('in');

            $.support.transition && $tip.hasClass('fade') ?
                $tip
                .one('bsTransitionEnd', complete)
                .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
                complete();

            this.hoverState = null;

            return this;
        };

        Tooltip.prototype.fixTitle = function() {
            var $e = this.$element;
            if ($e.attr('title') || typeof $e.attr('data-original-title') !== 'string') {
                $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
            }
        };

        Tooltip.prototype.hasContent = function() {
            return this.getTitle();
        };

        Tooltip.prototype.getPosition = function($element) {
            $element = $element || this.$element;

            var el = $element[0];
            var isBody = el.tagName === 'BODY';

            var elRect = el.getBoundingClientRect();
            if (elRect.width === null) {
                // width and height are missing in IE8,
                // so compute them manually;
                // see https://github.com/twbs/bootstrap/issues/14093
                elRect = $.extend({}, elRect, {
                    width: elRect.right - elRect.left,
                    height: elRect.bottom - elRect.top
                });
            }
            var elOffset = isBody ? {
                top: 0,
                left: 0
            } : $element.offset();
            var scroll = {scroll: isBody ?
                document.documentElement.scrollTop ||
                document.body.scrollTop :
                $element.scrollTop()
            };
            var outerDims = isBody ? {
                width: $(window).width(),
                height: $(window).height()
            } : null;

            return $.extend({}, elRect, scroll, outerDims, elOffset);
        };

        Tooltip.prototype.getCalculatedOffset = function(placement, pos, actualWidth, actualHeight) {
            return placement === 'bottom' ? {
                    top: pos.top + pos.height,
                    left: pos.left + pos.width / 2 - actualWidth / 2
                } :
                placement === 'top' ? {
                    top: pos.top - actualHeight,
                    left: pos.left + pos.width / 2 - actualWidth / 2
                } :
                placement === 'left' ? {
                    top: pos.top + pos.height / 2 - actualHeight / 2,
                    left: pos.left - actualWidth
                } :
                /* placement == 'right' */
                {
                    top: pos.top + pos.height / 2 - actualHeight / 2,
                    left: pos.left + pos.width
                };

        };

        Tooltip.prototype.getViewportAdjustedDelta = function(placement, pos, actualWidth, actualHeight) {
            var delta = {
                top: 0,
                left: 0
            };
            if (!this.$viewport) {
                return delta;
            }

            var viewportPadding = this.options.viewport && this.options.viewport.padding || 0;
            var viewportDimensions = this.getPosition(this.$viewport);

            if (/right|left/.test(placement)) {
                var topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll;
                var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight;
                if (topEdgeOffset < viewportDimensions.top) { // top overflow
                    delta.top = viewportDimensions.top - topEdgeOffset;
                } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) {
                    // bottom overflow
                    delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset;
                }
            } else {
                var leftEdgeOffset = pos.left - viewportPadding;
                var rightEdgeOffset = pos.left + viewportPadding + actualWidth;
                if (leftEdgeOffset < viewportDimensions.left) { // left overflow
                    delta.left = viewportDimensions.left - leftEdgeOffset;
                } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
                    delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset;
                }
            }

            return delta;
        };

        Tooltip.prototype.getTitle = function() {
            var title;
            var $e = this.$element;
            var o = this.options;

            title = $e.attr('data-original-title') ||
                        (typeof o.title === 'function' ?
                            o.title.call($e[0])
                            : o.title);
            return title;
        };

        Tooltip.prototype.getSLDSNubbinClass = function(aPos) {
            return this.SLDSPOSCLASSES[aPos];
        };

        Tooltip.prototype.getUID = function(prefix) {
            do {
                prefix += ~~(Math.random() * 1000000);
            } while (document.getElementById(prefix));
            return prefix;
        };

        Tooltip.prototype.tip = function() {
            if (!this.$tip) {
                this.$tip = $(this.options.template);
                if (this.$tip.length !== 1) {
                    throw new Error(
                        this.type +
                        ' `template` option must consist of exactly 1 top-level element!'
                    );
                }
            }
            return this.$tip;
        };

        Tooltip.prototype.arrow = function() {
            return (
                this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow')
            );
        };

        Tooltip.prototype.enable = function() {
            this.enabled = true;
        };

        Tooltip.prototype.disable = function() {
            this.enabled = false;
        };

        Tooltip.prototype.toggleEnabled = function() {
            this.enabled = !this.enabled;
        };

        Tooltip.prototype.toggle = function(e) {
            var self = this;
            if (e) {
                self = $(e.currentTarget).data('bs.' + this.type);
                if (!self) {
                    self = new this.constructor(e.currentTarget, this.getDelegateOptions());
                    $(e.currentTarget).data('bs.' + this.type, self);
                }
            }

            if (e) {
                self.inState.click = !self.inState.click;
                if (self.isInStateTrue()) {
                    self.enter(self);
                } else {
                    self.leave(self);
                }
            } else {
                self.tip().hasClass('in') ? self.leave(self) : self.enter(self);
            }
        };

        Tooltip.prototype.destroy = function() {
            var that = this;
            clearTimeout(this.timeout);
            this.hide(function() {
                that.$element.off('.' + that.type).removeData('bs.' + that.type);
                if (that.$tip) {
                    that.$tip.detach();
                }
                that.$tip = null;
                that.$arrow = null;
                that.$viewport = null;
            });
        };


        // TOOLTIP PLUGIN DEFINITION
        // =========================

        function Plugin(option) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('bs.tooltip');
                var options = typeof option === 'object' && option;

                if (!data && /destroy|hide/.test(option)) {
                    return;
                }
                if (!data) {
                    $this.data('bs.tooltip', (data = new Tooltip(this, options)));
                }
                if (typeof option === 'string') {
                    data[option]();
                }
            });
        }

        var old = $.fn.tooltip;

        $.fn.tooltip = Plugin;
        $.fn.tooltip.Constructor = Tooltip;

        // Enable all tooltips
        $('[data-toggle="tooltip"]').tooltip();

        // TOOLTIP NO CONFLICT
        // ===================

        $.fn.tooltip.noConflict = function() {
            $.fn.tooltip = old;
            return this;
        };

    });

}());

define("modules/components/tooltip", function(){});

/* ========================================================================
 * Bootstrap: dropdown.js v3.3.5
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


(function() {
    'use strict';

    require([], function() {

        // DROPDOWN CLASS DEFINITION
        // =========================

        var backdrop = '.dropdown-backdrop';
        var toggle = '[data-toggle="dropdown"]';
        var Dropdown = function(element) {
            $(element).on('click.bs.dropdown', this.toggle);
        };

        Dropdown.VERSION = '3.3.5';

        function getParent($this) {
            var selector = $this.attr('data-target');

            if (!selector) {
                selector = $this.attr('href');
                selector = selector && /#[A-Za-z]/.test(selector) &&
                    selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
            }

            var $parent = selector && $(selector);

            return $parent && $parent.length ? $parent : $this.parent();
        }

        function clearMenus(e) {
            if (e && e.which === 3) {
                return;
            }
            $(backdrop).remove();
            $(toggle).each(function() {
                var $this = $(this);
                var $parent = getParent($this);
                var relatedTarget = {
                    relatedTarget: this
                };

                if (!$parent.hasClass('open')) {
                    return;
                }

                if (e && e.type === 'click' && /input|textarea/i.test(e.target.tagName)
                        && $.contains($parent[0], e.target)) {
                    return;
                }

                $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget));

                if (e.isDefaultPrevented()) {
                    return;
                }

                $this.attr('aria-expanded', 'false');
                $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget);
            });
        }

        Dropdown.prototype.toggle = function(e) {
            var $this = $(this);

            if ($this.is('.disabled, :disabled')) {
                return;
            }

            var $parent = getParent($this);
            var isActive = $parent.hasClass('open');

            clearMenus();

            if (!isActive) {
                if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                    // if mobile we use a backdrop because click events don't delegate
                    $(document.createElement('div'))
                        .addClass('dropdown-backdrop')
                        .insertAfter($(this))
                        .on('click', clearMenus);
                }

                var relatedTarget = {
                    relatedTarget: this
                };
                $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget));

                if (e.isDefaultPrevented()) {
                    return;
                }

                $this
                    .trigger('focus')
                    .attr('aria-expanded', 'true');

                $parent
                    .toggleClass('open')
                    .trigger('shown.bs.dropdown', relatedTarget);
            }

            return false;
        };

        Dropdown.prototype.keydown = function(e) {
            if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) {
                return;
            }

            var $this = $(this);

            e.preventDefault();
            e.stopPropagation();

            if ($this.is('.disabled, :disabled')) {
                return;
            }

            var $parent = getParent($this);
            var isActive = $parent.hasClass('open');

            if (!isActive && e.which !== 27 || isActive && e.which === 27) {
                if (e.which === 27) {
                    $parent.find(toggle).trigger('focus');
                }
                return $this.trigger('click');
            }

            var desc = ' li:not(.disabled):visible a';
            var $items = $parent.find('.dropdown-menu' + desc);

            if (!$items.length) {
                return;
            }

            var index = $items.index(e.target);

            if (e.which === 38 && index > 0) {
                index--; // up
            }
            if (e.which === 40 && index < $items.length - 1) {
                index++; // down
            }
            if (!~index) {
                index = 0;
            }

            $items.eq(index).trigger('focus');
        };


        // DROPDOWN PLUGIN DEFINITION
        // ==========================

        function Plugin(option) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('bs.dropdown');

                if (!data) {
                    $this.data('bs.dropdown', (data = new Dropdown(this)));
                }
                if (typeof option === 'string') {
                    data[option].call($this);
                }
            });
        }

        var old = $.fn.dropdown;

        $.fn.dropdown = Plugin;
        $.fn.dropdown.Constructor = Dropdown;


        // DROPDOWN NO CONFLICT
        // ====================

        $.fn.dropdown.noConflict = function() {
            $.fn.dropdown = old;
            return this;
        };


        // APPLY TO STANDARD DROPDOWN ELEMENTS
        // ===================================

        $(document)
            .on('click.bs.dropdown.data-api', clearMenus)
            .on('click.bs.dropdown.data-api', '.dropdown form', function(e) {
                e.stopPropagation();
            })
            .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
            .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
            .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown);

    });

}());

define("modules/components/dropdown", function(){});

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

define("modules/components/popover", function(){});

/* global requirejs */

(function() {
    'use strict';

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
        'modules/components/popover'
    ], function() {
        // nothing to see here yet

    });
}());

define("modules/components/main.js", function(){});


require(["modules/components/main.js"]);
