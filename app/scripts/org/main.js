/* global define */

define([
    'jsforce',
    'jquery',
    'knockout',
    'org/OrgModel'
], function(f, $, ko, OrgModel) {
    'use strict';

    window.OrgModel = OrgModel;
    var isInitialised = false;
    var $loginButton = $('#login');
    var $loggedIn = $('#loggedIn');

    function init() {
        if (!isInitialised) {
            ko.applyBindings(OrgModel, $('#app')[0]);
            isInitialised = true;
        }
    }

    function setConnector(fCon) {
        OrgModel.setConnector(fCon);
    }

    function getUserProfile() {
        $.when(OrgModel.getUserProfile())
            .done(function() {
                //hide the button
                $loginButton.addClass('slds-hide');
                $loggedIn.removeClass('slds-hide');
            })
            .fail(function(err) {
                alert(err.message);
            });
    }

    function logout() {
        // this would be the correct way to do it
        // but sadly throws CORS error
        // return OrgModel.logout();
        // Temporary hack, clears cookies;
        f.browser.logout();
        $loggedIn.addClass('slds-hide');
        $loginButton.removeClass('slds-hide');
        // Should do reset now to clear out data
    }

    function reset() {
        OrgModel.reset();
    }

    return {
        init: init,
        model: OrgModel,
        setConnector: setConnector,
        getUserProfile: getUserProfile,
        logout: logout,
        reset: reset
    };

});
