/* global define */

define([
    'jquery',
    'modules/login/LoginDialog',
    'modules/login/LogoutDialog'
], function($, loginDialog) {
    'use strict';

    function init() {
        var $connectionDeferred = $.Deferred();
        function loggedIn(fCon) {
            $connectionDeferred.resolve(fCon);
        }

        loginDialog.init()
            .done(loggedIn)
            .fail(function(err) {
                console.error('Error logging in.');
                $connectionDeferred.reject(err);
            });
        return $connectionDeferred.promise();
    }

    return {
        init: init
    };

});
