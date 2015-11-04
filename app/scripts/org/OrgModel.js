/* global define */

/* SINGLETON */

define(
    'org/OrgModelImp', [
        'jquery',
        'knockout'
    ],
    function($, ko) {
        'use strict';
        var OrgModel = (function() {
            function OrgModel() {
                var self = this;
                function Account(anAccountObj) {
                    this.id = anAccountObj.Id;
                    this.name = anAccountObj.Name;
                    this.accNumber = anAccountObj.AccountNumber;
                    this.city = anAccountObj.BillingAddress.city;
                    this.priority = anAccountObj.CustomerPriority__c;
                    this.employees = anAccountObj.NumberOfEmployees;
                    this.ownership = anAccountObj.Ownership;
                }
                this.accounts = ko.observableArray([]);
                this.totalAccounts = ko.observable('');
                this.updateAccounts = function(aAccountData) {
                    self.totalAccounts(aAccountData.length);
                    aAccountData = aAccountData.slice(0,10);
                    aAccountData.forEach(function(anAccount) {
                        if (!anAccount.BillingAddress) {
                            anAccount.BillingAddress = {
                                city: '---'
                            };
                        }
                        self.accounts.push(new Account(anAccount));
                    });
                };
                function Contact(aContactObj) {
                    this.name = aContactObj.Name;
                    this.title = aContactObj.Title;
                    this.department = aContactObj.Department;
                    this.mobile = aContactObj.MobilePhone;
                    this.email = aContactObj.Email;
                    this.leadSource = aContactObj.LeadSource;
                }
                this.contacts = ko.observableArray([]);
                this.totalContacts = ko.observable('');
                this.updateContacts = function(aContactData) {
                    self.totalContacts(aContactData.length);
                    aContactData = aContactData.slice(0,10);
                    aContactData.forEach(function(aContact) {
                        self.contacts.push(new Contact(aContact));
                    });
                };
                this.username = ko.observable('');
                this.userPhoto = ko.observable('/assets/images/avatar2.jpg');
                this.reset = function() {
                    this.username(null);
                    this.sessionid = undefined;
                    this.fullname(null);
                    this.shows.removeAll();
                };
                this.isLoggedIn = ko.observable(false);
                this.setConnector = function(aConn) {
                    this.isLoggedIn(true);
                    this.connector = aConn;
                };
                this.logout = function() {
                    this.isLoggedIn(false);
                    return this.connector.logout();
                };
                this.getUserProfile = function() {
                    this.connector.identity().then(function(res, err) {
                        if (err) {
                            $deferred.reject(err);
                        }
                        self.username(res.display_name);

                        if (res.photos && res.photos.thumbnail) {
                            var imagePath = res.photos.thumbnail +
                                '?oauth_token=' +
                                self.connector.accessToken;
                            self.userPhoto(imagePath);
                        }
                        $deferred.resolve();
                    });
                    var $deferred = $.Deferred();
                    return $deferred.promise();
                };
                this.getAccounts = function() {
                    this.connector.query(
                    'SELECT Id, Name, NumberOfEmployees, AccountNumber,'
                        + 'BillingAddress, CustomerPriority__c, Ownership FROM Account',
                    function(err, res) {
                        if (err) {
                            console.error(err);
                        }
                        console.log(res);
                        self.updateAccounts(res.records);
                    });
                };
                this.getContacts = function() {
                    this.connector.query(
                    'SELECT Name, Title, Department, MobilePhone, Email, LeadSource FROM Contact',
                    function(err, res) {
                        if (err) {
                            console.error(err);
                        }
                        console.log(res);
                        self.updateContacts(res.records);
                    });
                };
            }

            return OrgModel;
        })();

        return OrgModel;
    });


define([
    'org/OrgModelImp'
], function(OrgModel) {
    'use strict';
    return new OrgModel();
});
