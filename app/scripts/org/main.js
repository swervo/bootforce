/* global define */

define([
    'jquery',
    'knockout',
    'org/OrgModel'
], function($, ko, OrgModel) {
    'use strict';

    window.OrgModel = OrgModel;
    var isInitialised = false;
    var $loginButton = $('#login');

    function init() {
        console.log('initis');
        if (!isInitialised) {
            ko.applyBindings(OrgModel, $('#app')[0]);
            isInitialised = true;
        }
    }

    // function setUserState(aShowUid, aUserDetails, aShowDetails) {
    //     var canWrite = OrgModel.setUserState(aShowUid, aUserDetails, aShowDetails);
    //     return canWrite;
    // }

    // function changeCurrentShowUid(aShowUid) {
    //     OrgModel.currentShowUid(aShowUid);
    // }
    function setConnector(fCon) {
        OrgModel.setConnector(fCon);
    }

    function getUserProfile() {
        $.when(OrgModel.getUserProfile())
            .done(function() {
                //hide the button
                $loginButton.addClass('slds-hide');
            })
            .fail(function(err) {
                alert(err.message);
            });
    }

    function reset() {
        OrgModel.reset();
    }

    return {
        init: init,
        model: OrgModel,
        setConnector: setConnector,
        getUserProfile: getUserProfile,
        reset: reset
    };

});
