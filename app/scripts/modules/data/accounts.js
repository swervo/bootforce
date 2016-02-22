/* global define */

define([
    'org/OrgModel'
], function(OrgModel) {
    'use strict';

    var isInitialised = false;
    var $getAccountsButton = $('#getAccounts');
    var $accountsLoadingAnim = $('#accountsLoading');

    function init() {
        if (!isInitialised) {
            isInitialised = true;
            $getAccountsButton.on('click', getAccounts);
        }
    }

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

    init();

});
