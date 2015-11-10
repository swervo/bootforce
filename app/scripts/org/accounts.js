/* global define */

define([
    'knockout'
], function(ko) {
    'use strict';

    function Account(anAccountObj) {
        this.id = anAccountObj.Id;
        this.name = anAccountObj.Name;
        this.accNumber = anAccountObj.AccountNumber;
        this.city = anAccountObj.BillingAddress.city;
        this.priority = anAccountObj.CustomerPriority__c;
        this.employees = anAccountObj.NumberOfEmployees;
        this.ownership = anAccountObj.Ownership;
    }

    function Accounts() {

    }

    Accounts.prototype = {
        accounts: ko.observableArray([]),
        totalAccounts: ko.observable(''),
        updateAccounts: function(aAccountData) {
            this.totalAccounts(aAccountData.length);
            aAccountData = aAccountData.slice(0,10);
            aAccountData.forEach(function(aAccount) {
                this.accounts.push(new Account(aAccount));
            }, this);
        }
    };



    return Accounts;

});
