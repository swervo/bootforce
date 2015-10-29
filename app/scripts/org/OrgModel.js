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

                function Show(aShowObj) {
                    this.data = aShowObj.data;
                    this.format = aShowObj.format;

                    this.id = aShowObj.id;
                    this.name = aShowObj.name;
                    this.site = aShowObj.site;
                    this.slug = aShowObj.slug;
                    this.tweet_slug = aShowObj.tweet_slug;
                }
                this.username = ko.observable('');
                this.userPhoto = ko.observable('/assets/images/avatar2.jpg');
                this.sessionid = undefined;
                this.fullname = ko.observable();
                this.currentShowUid = undefined;
                this.shows = ko.observableArray([]);
                this.setUser = function(data) {
                    this.username(data.username);
                    this.sessionid = data.sessionid;
                    this.fullname(data.fullname);
                };
                this.updateShows = function(aShowData) {
                    aShowData.forEach(function(show) {
                        self.shows.push(new Show(show));
                    });
                };
                this.setUserState = function(aShowUid, aUserDetails, aShowDetails) {
                    this.updateShows(aShowDetails);
                    this.setUser(aUserDetails);
                    this.setCurrentShowUid(aShowUid);
                    return this.canWrite;
                };
                this.reset = function() {
                    this.username(null);
                    this.sessionid = undefined;
                    this.fullname(null);
                    this.shows.removeAll();
                };
                this.setConnector = function(aConn) {
                    this.connector = aConn;
                };
                this.getUserProfile = function() {
                    // this.connector.query('SELECT Id, Name FROM Account', function(err, res) {
                    //     if (err) {
                    //         console.error(err);
                    //     }
                    //     console.log(res);
                    // });
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
                        
                        // localStorage.setItem('sf_user_info', JSON.stringify(userInfo));
                    });
                    var $deferred = $.Deferred();
                    return $deferred.promise();
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
