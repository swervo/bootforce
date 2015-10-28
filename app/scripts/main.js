/* global requirejs */

(function() {
    'use strict';

    requirejs.config({
        baseUrl: 'scripts',
        paths: {
            jquery: '../lib/jquery/dist/jquery',
            knockout: '../lib/knockout/dist/knockout',
            jsforce: '../lib/jsforce/build/jsforce'
        },
        shim: {}
    });

    require([
        'jquery',
        'knockout',
        'modules/login/main',
        'org/main',
        'modules/components/main',
        'utils/transition'
    ], function($, ko, conn, org) {
        org.init();
        // put initialisation stuff here
        conn.init()
            .done(function(fCon) {
                // store this in utils
                console.log(fCon);
                org.setConnector(fCon);
                org.model.getUserProfile();
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
