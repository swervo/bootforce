/* jshint node:true */

'use strict';

var express = require('express');
var http = require('http');
var once = require('once');
var path = require('path');
var debug = require('debug')('main');

module.exports = Server;

function Server(port, serverURL, silent) {
    this._port = port;
    this._serverURL = serverURL;
    this._silent = !!silent;
    this.app = null;
}

Server.prototype._initialize = function (callback) {
    this.app = express();
    this.app.httpServer = http.createServer(this.app);


    this.app.set('port', this._port);
    this.app.use(express.static(path.join(__dirname, '../build')));

    callback(null);
};

Server.prototype._listen = function (callback) {

    callback = once(callback);

    this.app.httpServer.listen(this.app.get('port'), function (error) {
        if (error) {
            return callback(error);
        }
        callback();
    });

    this.app.httpServer.on('error', function (error) {
        callback(error);
    });
};

// public API
Server.prototype.start = function (callback) {
    var that = this;

    if (this.app) {
        return callback(new Error('Server is already up and running.'));
    }

    this._initialize(function (error) {
        if (error) {
            return callback(error);
        }
        that._listen(callback);
    });
};

Server.prototype.stop = function (callback) {
    var that = this;
    if (!this.app.httpServer) {
        return callback();
    }

    this.app.httpServer.close(function () {
        that.app.httpServer.unref();
        that.app = null;
        callback();
    });
};
