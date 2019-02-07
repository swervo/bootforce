/* jshint node:true */

'use strict';

var express = require('express');
var http = require('http');
var once = require('once');
var path = require('path');
var debug = require('debug')('main');
var mTodos = require('./controllers/todos');

class Server {
    constructor(port, serverURL, silent) {
        this._port = port;
        this._serverURL = serverURL;
        this._silent = !!silent;
        this.app = null;
    }

    // Adding a method to the constructor
    _initialize (callback) {
        this.app = express();
        this.app.httpServer = http.createServer(this.app);


        this.app.set('port', this._port);
        if (process.env.NODE_ENV === 'dev') {
            this.app.use(express.static(path.join(__dirname, '../app')));
        } else {
            this.app.use(express.static(path.join(__dirname, '../build')));
        }
        this.app.use(express.static(path.join(__dirname, '../node_modules')));
        this.app.get('/data/api/todos', mTodos.getTodos);

        mTodos.init();
        callback(null);
    }

    _listen (callback) {

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
    }

    // public API
    start (callback) {
        console.log('hey');
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
    }

    stop (callback) {
        var that = this;
        if (!this.app.httpServer) {
            return callback();
        }

        this.app.httpServer.close(function () {
            that.app.httpServer.unref();
            that.app = null;
            callback();
        });
    }
}

module.exports = Server;
