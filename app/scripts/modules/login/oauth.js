'use strict';
(function() {

    require([
        'jsforce'
    ], function(f) {
        console.log(f);
        var conn = new f.Connection({
            oauth2: {
                // you can change loginUrl to connect to sandbox or prerelease env.
                loginUrl : 'https://login.salesforce.com',
                clientId: '3MVG9Rd3qC6oMalUsp2rPGB248uHAGVxkr6GZb'
                    + 'LeF87wvo_z46PbBonmZ.xPfY8_pUdHwygzhfgRpSigiyF9e',
                clientSecret: '8932558667950573739',
                redirectUri: 'http://localhost:8000/#/callback'
            }
        });

        conn.login(
         'swervo@papersnail.co.uk',
         'userPassword' + 'LapdF8sLQgwvbe5CBkG3D8nL',
         function(err, userInfo) {
            if (err) {
                return console.error(err);
            }
            // Now you can get the access token and instance URL information.
            // Save them to establish connection next time.
            console.log(conn.accessToken);
            console.log(conn.instanceUrl);
            // logged in user property
            console.log('User ID: ' + userInfo.id);
            console.log('Org ID: ' + userInfo.organizationId);
            conn.query('SELECT Id, Name FROM Account', function(err, res) {
                if (err) {
                    console.log(err);
                }
                console.log(res);
            });
            // ...
        });
    });
}());
