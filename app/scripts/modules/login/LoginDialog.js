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
        }, function(err, res) {
            if (err) {
                console.error(err);
                alert(err.message);
                closeDialog();
                $logInDeferred.reject(err);
            }
            console.log(res.status);
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
            clientId: '3MVG9Rd3qC6oMalUsp2rPGB248uHAGVxkr6GZb'
                + 'LeF87wvo_z46PbBonmZ.xPfY8_pUdHwygzhfgRpSigiyF9e',
            redirectUri: 'http://localhost:8000/callback.html',
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
