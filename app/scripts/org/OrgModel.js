/* global define */

/* SINGLETON */

define(
    'org/OrgModelImp', [
        'knockout'
    ],
    function(ko) {
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
                this.username = ko.observable();
                this.sessionid = undefined;
                this.fullname = ko.observable();
                this.currentShowUid = undefined;
                this.canWrite = false;
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
                    this.connector.identity().then(function(res) {
                        console.log('id', res);
                        self.username(res.display_name);
                        self.photos = res.photos;
                        
                        // localStorage.setItem('sf_user_info', JSON.stringify(userInfo));
                        // renderProfile();
                    });

                    function renderProfile() {
                        $('#navigation .navbar-right li.login').hide();
                        var profileMenu = $('#navigation .navbar-right li.profile').show();
                        profileMenu.find('.profile-icon').empty().append(
                            $('<img>').attr('src',
                                userInfo.photos && userInfo.photos.thumbnail ?
                                userInfo.photos.thumbnail + '?oauth_token=' + conn.accessToken :
                                '/images/profile-none.png'
                            )
                        );
                        profileMenu.find('.profile-name').text(userInfo.username).attr('title', userInfo.username);
                    }
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
