/* global define */

define([
    'jsforce',
    'jquery'
], function(f, $) {
    'use strict';

    // function loginPanel(aCallback) {
    var $loginDialog = $('#loginDialog');
    var $loginCancel = $('#loginCancel', $loginDialog);
    var $loginConnect = $('#loginConnect', $loginDialog);
    var $loginOrgType = $('#loginOrgType', $loginDialog);
    var $logInDeferred;
    var orgTypeLoginUrl = $loginOrgType[0].options[0].value;
    function tryLogin() {
        f.browser.login({
            loginUrl: orgTypeLoginUrl
        }, function(err) {
            if (err) {
                alert(err.message);
                closeDialog();
                $logInDeferred.reject(err);
            }
        });
    }
    function closeDialog() {
        $loginDialog.modal('hide');
    }

    $loginConnect.on('click', tryLogin);
    $loginCancel.on('click', function() {
        closeDialog();
    });
    $loginOrgType.on('change', function(e) {
        var selecter = e.target;
        orgTypeLoginUrl = selecter.options[selecter.selectedIndex].value;
    });

    function init() {
        f.browser.init({
            clientId: '3MVG9Rd3qC6oMalUsp2rPGB248pmNZXR7f'
                + 'BNcNpBpm27UadFGFLF1iU5iDK0MizIm54mYU.slyNZOyBeTKvw9',
            // clientId: '3MVG9Rd3qC6oMalUsp2rPGB248ukrY'
            //      + '4H1SxxC8p.UUdHIkOeD1UOEmkWfIudtDj8LKAM01Hp.jaYz0wndRv6F',
            redirectUri: 'https://bootforce.herokuapp.com/callback.html',
            // redirectUri: 'http://localhost:8001/callback.html',
            proxyUrl: 'https://node-salesforce-proxy.herokuapp.com/proxy/'
        });
        f.browser.on('connect', function(conn) {
            $loginDialog.modal('hide');
            $logInDeferred.resolve(conn);
        });
        $logInDeferred = $.Deferred();
        return $logInDeferred.promise();
    }

    return {
        init: init
    };
});
