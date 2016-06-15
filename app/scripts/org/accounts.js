'use strict';

var ko = require('knockout');

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
    },
    getAccounts: function() {
            this.connector.query(
            'SELECT Id, Name, NumberOfEmployees, AccountNumber,'
                + 'BillingAddress, CustomerPriority__c, Ownership FROM Account',
            function(err, res) {
                if (err) {
                    console.error(err);
                }
                console.log(res);
                this.updateAccounts(res.records);
            }.bind(this));
    }
};

module.exports = Accounts;
