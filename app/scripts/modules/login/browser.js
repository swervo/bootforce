(function() {
    'use strict';

    require([
        'jsforce',
        'jquery'
    ], function(f, $) {
        f.browser.init({
            clientId: '3MVG9Rd3qC6oMalUsp2rPGB248uHAGVxkr6GZb'
                + 'LeF87wvo_z46PbBonmZ.xPfY8_pUdHwygzhfgRpSigiyF9e',
            redirectUri: 'http://localhost:8000/callback.html',
            proxyUrl: 'https://node-salesforce-proxy.herokuapp.com/proxy/'
        });
        f.browser.on('connect', function(conn) {
            conn.query('SELECT Id, Name FROM Account', function(err, res) {
                if (err) {
                    console.error(err);
                }
                console.log(res);
            });
        });
        // loginButton.on('click', function() {
        //     f.browser.login();
        // });
    });
}());
