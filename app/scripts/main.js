/* global requirejs */

(function() {
    'use strict';

    requirejs.config({
        baseUrl: 'scripts',
        paths: {
            text: '../lib/text/text',
            jquery: '../lib/jquery/dist/jquery',
            knockout: '../lib/knockout/dist/knockout',
            koAMDHelpers: '../lib/knockout-amd-helpers/build/knockout-amd-helpers',
            jsforce: '../lib/jsforce/build/jsforce'
        },
        shim: {},
        map: {
          // '*' means all modules will get 'jquery-private'
          // for their 'jquery' dependency.
          '*': { 'jquery': 'jquery-private' },
          // 'jquery-private' wants the real jQuery module
          'jquery-private': { 'jquery': 'jquery' }
        }
    });


    require([
        'knockout',
        'modules/login/main',
        'org/main',
        'modules/components/main',
        'modules/data/accounts',
        'modules/data/contacts',
        'text',
        'koAMDHelpers'
    ], function(ko, conn, org) {
        ko.amdTemplateEngine.defaultPath = '../tmpl/partials';
        org.init();
        // put initialisation stuff here
        conn.init()
            .done(function(fCon) {
                org.setConnector(fCon);
                org.getUserProfile();
            })
            .fail(function(err) {
                console.error('Error logging in.');
                console.log(err);
                // setDisplayMode(false, false);
                // doLogin();
                // notifier.error('Log in unsuccesful. Please try again.');
            });
    });
}());
