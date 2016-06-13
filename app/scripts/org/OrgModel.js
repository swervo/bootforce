/* global define */

/* SINGLETON */

define(
    'org/OrgModelImp', [
        'knockout',
        'org/contacts',
        'org/accounts',
        'org/todos'
    ],
    function(ko, Contacts, Accounts, Todos) {
        'use strict';
        var OrgModel = (function() {
            function OrgModel() {
                Contacts.call(this);
                Accounts.call(this);
                Todos.call(this);
            }

            OrgModel.prototype = Object.create(Contacts.prototype);
            $.extend(OrgModel.prototype, Accounts.prototype);
            $.extend(OrgModel.prototype, Todos.prototype);

            OrgModel.prototype.username = ko.observable('');
            OrgModel.prototype.userPhoto = ko.observable('/assets/images/avatar2.jpg');
            OrgModel.prototype.reset = function() {
                this.username(null);
                this.sessionid = undefined;
                this.fullname(null);
                this.shows.removeAll();
            };
            OrgModel.prototype.isLoggedIn = ko.observable(false);
            OrgModel.prototype.setConnector = function(aConn) {
                this.isLoggedIn(true);
                this.connector = aConn;
            };
            OrgModel.prototype.logout = function() {
                this.isLoggedIn(false);
                return this.connector.logout();
            };
            OrgModel.prototype.getUserProfile = function() {
                this.connector.identity().then(function(res, err) {
                    if (err) {
                        $deferred.reject(err);
                    }
                    this.username(res.display_name);

                    if (res.photos && res.photos.thumbnail) {
                        var imagePath = res.photos.thumbnail +
                            '?oauth_token=' +
                            this.connector.accessToken;
                        this.userPhoto(imagePath);
                    }
                    $deferred.resolve();
                }.bind(this));
                var $deferred = $.Deferred();
                return $deferred.promise();
            };
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
