// # tweetmap Server
// Handles the creation of an HTTP Server and Websocket Server

var Promise = require('bluebird'),
    fs = require('fs'),
    packageInfo = require('../../package.json'),
    errors = require('./errors'),
    config = require('./config');

function Server(rootApp) {
    this.rootApp = rootApp;
    this.httpServer = null;
    this.connections = {};
    this.connectionId = 0;

    // Expose config module for use externally.
    this.config = config;
}

Server.prototype.connection = function (socket) {
    var self = this;

    self.connectionId += 1;
    socket._tweetmapId = self.connectionId;

    socket.on('close', function () {
        delete self.connections[this._tweetmapId];
    });

    self.connections[socket._tweetmapId] = socket;
};

// Most browsers keep a persistent connection open to the server
// which prevents the close callback of httpServer from returning
// We need to destroy all connections manually
Server.prototype.closeConnections = function () {
    var self = this;

    Object.keys(self.connections).forEach(function (socketId) {
        var socket = self.connections[socketId];

        if (socket) {
            socket.destroy();
        }
    });
};

Server.prototype.logStartMessages = function () {
    // Startup & Shutdown messages
    if (process.env.NODE_ENV === 'production') {
        console.log(
            'tweetmap is running...'.green,
            '\nYour host is now available on',
            config.url,
            '\nCtrl+C to shut down'.grey
        );
    } else {
        console.log(
            ('tweetmap is running in ' + process.env.NODE_ENV + '...').green,
            '\nListening on',
            config.getSocket() || config.server.host + ':' + config.server.port,
            '\nUrl configured as:',
            config.url,
            '\nCtrl+C to shut down'.grey
        );
    }

    function shutdown() {
        console.log('\ntweetmap has shut down'.red);
        if (process.env.NODE_ENV === 'production') {
            console.log(
                '\nYour host is now offline'
            );
        } else {
            console.log(
                '\ntweetmap was running for',
                Math.round(process.uptime()),
                'seconds'
            );
        }
        process.exit(0);
    }
    // ensure that tweetmap exits correctly on Ctrl+C and SIGTERM
    process.
    removeAllListeners('SIGINT').on('SIGINT', shutdown).
    removeAllListeners('SIGTERM').on('SIGTERM', shutdown);
};

Server.prototype.logShutdownMessages = function () {
    console.log('tweetmap is closing connections'.red);
};

/**
 * Starts the tweetmap server listening on the configured port.
 * Alternatively you can pass in your own express instance and let tweetmap
 * start lisetning for you.
 * @param  {Object=} externalApp Optional express app instance.
 * @return {Promise}
 */
Server.prototype.start = function (externalApp) {
    var self = this,
        rootApp = externalApp ? externalApp : self.rootApp;

    // ## Start tweetmap App
    return new Promise(function (resolve) {
        self.httpServer = rootApp.listen(
            config.server.port,
            config.server.host
        );

        self.httpServer.on('error', function (error) {
            if (error.errno === 'EADDRINUSE') {
                errors.logError(
                    '(EADDRINUSE) Cannot start tweetmap.',
                    'Port ' + config.server.port + ' is already in use by another program.',
                    'Is another tweetmap instance already running?'
                );
            } else {
                errors.logError(
                    '(Code: ' + error.errno + ')',
                    'There was an error starting your server.',
                    'Please use the error code above to search for a solution.'
                );
            }
            process.exit(-1);
        });
        self.httpServer.on('connection', self.connection.bind(self));
        self.httpServer.on('listening', function () {
            self.logStartMessages();
            resolve(self);
        });
    });
};

// Returns a promise that will be fulfilled when the server stops.
// If the server has not been started, the promise will be fulfilled
// immediately
Server.prototype.stop = function () {
    var self = this;

    return new Promise(function (resolve) {
        if (self.httpServer === null) {
            resolve(self);
        } else {
            self.httpServer.close(function () {
                self.httpServer = null;
                self.logShutdownMessages();
                resolve(self);
            });

            self.closeConnections();
        }
    });
};

// Restarts the tweetmap application
Server.prototype.restart = function () {
    return this.stop().then(this.start.bind(this));
};

// To be called after `stop`
Server.prototype.hammertime = function () {
    console.log('Can\'t touch this'.green);

    return Promise.resolve(this);
};

module.exports = Server;
