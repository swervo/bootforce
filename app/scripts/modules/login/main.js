/* global define */
'use strict';

define([
    'modules/login/LoginDialog',
    'modules/login/LogoutDialog'
], function(loginDialog) {

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
