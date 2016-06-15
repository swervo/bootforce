'use strict';

var $ = require('jquery');
var loginDialog = require('../../modules/login/LoginDialog');


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

module.exports = {
    init: init
};
