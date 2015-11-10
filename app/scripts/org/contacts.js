/* global define */

define([
    'knockout',
], function(ko) {
    'use strict';

    function Contact(aContactObj) {
        this.name = aContactObj.Name;
        this.title = aContactObj.Title;
        this.department = aContactObj.Department;
        this.mobile = aContactObj.MobilePhone;
        this.email = aContactObj.Email;
        this.leadSource = aContactObj.LeadSource;
    }

    function Contacts() {

    }

    Contacts.prototype = {
        contacts: ko.observableArray([]),
        totalContacts: ko.observable(''),
        updateContacts: function(aContactData) {
            this.totalContacts(aContactData.length);
            aContactData = aContactData.slice(0,10);
            aContactData.forEach(function(aContact) {
                this.contacts.push(new Contact(aContact));
            }, this);
        }
    };



    return Contacts;

});
