'use strict';

var conn = require('./modules/login/main');
var org = require('./org/main');

require('./modules/components/main');
// require('./modules/data/accounts');
// require('./modules/data/contacts');


window.bootforce = {};
window.bootforce.prefix = 'slds-';
org.init();
// put initialisation stuff here
org.getLocalData();
conn.init()
    .done(function(fCon) {
        org.setConnector(fCon);
        org.getUserProfile();
    })
    .fail(function(err) {
        console.error('Error logging in.');
        console.log(err);
        // setDisplayMode(false, false);
        // doLogin();
        // notifier.error('Log in unsuccesful. Please try again.');
    });

