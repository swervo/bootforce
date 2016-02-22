/* global define */

define([
    'org/OrgModel'
], function(OrgModel) {
    'use strict';

    var isInitialised = false;
    var $getAccountsButton = $('#getContacts');
    var $contactsLoadingAnim = $('#accountsLoading');

    function init() {
        if (!isInitialised) {
            isInitialised = true;
            $getAccountsButton.on('click', getContacts);
        }
    }

    function getContacts() {
        // show the loading anim
        $contactsLoadingAnim.removeClass('slds-hide');
        $.when(OrgModel.getContacts())
            .done(function() {
                //hide the loading anim
                $contactsLoadingAnim.addClass('slds-hide');
            })
            .fail(function(err) {
                alert(err.message);
                // show a notification
            });
    }

    init();

});
