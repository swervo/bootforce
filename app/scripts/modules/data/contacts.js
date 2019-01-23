/* global define */
'use strict';

define([
    'org/OrgModel'
], function(OrgModel) {
    var isInitialised = false;
    var $getAccountsButton = $('#getContacts');
    var $contactsLoadingAnim = $('#accountsLoading');


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

    function init() {
        if (!isInitialised) {
            isInitialised = true;
            $getAccountsButton.on('click', getContacts);
        }
    }

    init();

});
