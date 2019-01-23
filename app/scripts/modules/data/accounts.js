/* global define */
'use strict';

define([
    'org/OrgModel'
], function(OrgModel) {
    var isInitialised = false;
    var $getAccountsButton = $('#getAccounts');
    var $accountsLoadingAnim = $('#accountsLoading');


    function getAccounts() {
        // show the loading anim
        $accountsLoadingAnim.removeClass('slds-hide');
        $.when(OrgModel.getAccounts())
        .done(function() {
            //hide the loading anim
            $accountsLoadingAnim.addClass('slds-hide');
        })
        .fail(function(err) {
            alert(err.message);
            // show a notification
        });
    }

    function init() {
        if (!isInitialised) {
            isInitialised = true;
            $getAccountsButton.on('click', getAccounts);
        }
    }

    init();

});
