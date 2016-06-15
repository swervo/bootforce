'use strict';

var f = require('jsforce');
var $ = require('jquery');
var ko = require('knockout');
var cOrgModel = require('../org/OrgModel');
debugger;
var OrgModel = new cOrgModel();

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

function getLocalData() {
    OrgModel.getTodos();
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

module.exports = {
    init: init,
    model: OrgModel,
    getLocalData: getLocalData,
    setConnector: setConnector,
    getUserProfile: getUserProfile,
    logout: logout,
    reset: reset
};
