// # tweetmap Server
// Handles the creation of an HTTP Server and Websocket Server

var Promise = require('bluebird'),
    errors = require('./errors'),
    config = require('./config'),
    api = require('./api');

/**
 * ## Server
 * @constructor
 * @param {Object} rootApp - parent express instance
 * @param {Object} socketApp - parent socket.io instance
 */
function Server(rootApp, socketApp) {
    this.rootApp = rootApp;
    this.socketApp = socketApp;
    this.httpServer = null;
    this.connections = {};
    this.connectionId = 0;

    // Expose config module for use externally.
    this.config = config;
}

/**
 * Starts the tweetmap servers listening on the configured ports.
 * @returns {bluebird|exports|module.exports}
 */
Server.prototype.start = function () {
    var self = this,
        rootApp = self.rootApp,
        socketApp = self.socketApp;

    // ## start tweetmap application
    return new Promise(function (resolve) {
        self.httpServer = rootApp.listen(
            config.server.port,
            config.server.host
        );

        // attach http server to socket.io
        socketApp.attach(self.httpServer);
        socketApp.on('connection', api);

        self.httpServer.on('error', self.error);
        self.httpServer.on('connection', self.connection.bind(self));
        self.httpServer.on('listening', function () {
            self.logStartMessages();
            resolve(self);
        });
    });
};

/**
 * Returns a promise that will be fulfilled when the server stops.
 * If the server has not been started, the promise will be fulfilled
 * immediately.
 */
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

/**
 * Restarts the tweetmap application
 */
Server.prototype.restart = function () {
    return this.stop().then(this.start.bind(this));
};

/**
 * To be called after `stop`
 */
Server.prototype.hammertime = function () {
    console.log('Can\'t touch this'.green);

    return Promise.resolve(this);
};

// ### Helper functions below

Server.prototype.connection = function (socket) {
    var self = this;

    self.connectionId += 1;
    socket._tweetmapId = self.connectionId;

    socket.on('close', function () {
        delete self.connections[this._tweetmapId];
    });

    self.connections[socket._tweetmapId] = socket;
};

Server.prototype.error = function (error) {
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
            config.server.host + ':' + config.server.port,
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
    process.removeAllListeners('SIGINT').on('SIGINT', shutdown).removeAllListeners('SIGTERM').on('SIGTERM', shutdown);
};

Server.prototype.logShutdownMessages = function () {
    console.log('tweetmap is closing connections'.red);
};

module.exports = Server;
