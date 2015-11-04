#!/usr/bin/env node

'use strict';

var app = require('commander');
var debug = require('debug')('app');
var Server = require('./server/server');

var port = process.env.PORT || 5000;
var serverURL = process.env.SERVER_URL || 'http://localhost:4000';

app.version('0.1.0')
    .usage('[options]')
    .option('-p --port [port]', 'The port to listen on. [' + port + ']', port)
    .option('--serverURL [url]', 'The full URL this server is reachable on. [' + serverURL + ']', serverURL)
    .parse(process.argv);

debug('');
debug('============================================');
debug('SLDS server will use the following settings');
debug('============================================');
debug();
debug(' Port:                  ', parseInt(app.port, 10));
debug(' Server URL:            ', app.serverURL);
debug();
debug('==========================================');
debug('');

var server = new Server(parseInt(app.port, 10),
    app.serverURL,
    app.silent
);

server.start(function (error) {
    if (error) {
        debug('Unable to start server. Reason: ', error);
        process.exit(2);
    }

    debug('Server up and running on port ', app.port);
});
