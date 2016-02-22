// # Bootup

// Module dependencies
var express = require('express'),
    socket = require('socket.io'),
    compress = require('compression'),
    logger = require('morgan'),
    favicon = require('serve-favicon'),
    path = require('path'),
    slashes = require('connect-slashes'),

    config = require('./config'),
    data = require('./data'),
    models = require('./models'),
    Server = require('./tweetmap'),

    ONE_DAY_MS = 86400000;

// ## Initializes the application.
// Sets up the express server instance, socket.io instance
// Instantiates the configuration, models, data.
function init(options) {
    // Get reference to an express app instance.
    var app = express(),
    // Get reference to an socket.io app instance.
        io = socket();

    // ### Initialisation
    // The server and its dependencies require a populated config
    // It returns a promise that is resolved when the application
    // has finished starting up.

    // Load our config.js file from the local file system.
    return config.load(options.config).then(function () {
        // Initialise the models, create dynamoDB tables
        return models.init();
    }).then(function () {
        // Initialize data, start twitter streaming
        return data.init();
    }).then(function () {
        // ##Configuration the express
        var logging = config.logging;

        // enabled gzip compression by default
        if (config.compress !== false) {
            // compress all requests
            app.use(compress());
        }

        // Logging configuration
        if (logging !== false) {
            if (app.get('env') !== 'development') {
                // Standard Apache combined log output.
                app.use(logger('combined'));
            } else {
                // Concise output colored by response status for development use.
                app.use(logger('dev'));
            }
        }

        // favicon
        app.use(favicon(path.join(config.paths.corePath, '/shared/favicon.ico')));
        // place static assets routing before slashes configuration
        app.use('/public', express.static(path.join(config.paths.corePath, '/client'), {maxAge: ONE_DAY_MS}));
        // Add in all trailing slashes
        app.use(slashes(true));

        // easiest routing policy for tweetmap
        app.get('/', function (req, res) {
            res.redirect('/public/index.html');
        });

        // ##Configuration the socket.io

        // the attached server will serve the client files. Defaults to true.
        io.serveClient(true);

        return new Server(app, io);
    });
}

module.exports = init;
