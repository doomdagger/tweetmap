// # Bootup

// Module dependencies
var express     = require('express'),
    compress    = require('compression'),
    logger      = require('morgan'),
    path        = require('path'),
    slashes         = require('connect-slashes'),

    api         = require('./api'),
    config      = require('./config'),
    data        = require('./data'),
    models      = require('./models'),
    Server      = require('./tweetmap'),

    ONE_DAY_MS  = 86400000;


// ## Initializes the application.
// Sets up the express server instance, socket.io instance
// Instantiates the tweetmap singleton, configuration, models, data, api.
function init(options) {
    // Get reference to an express app instance.
    var app = express();

    // ### Initialisation
    // The server and its dependencies require a populated config
    // It returns a promise that is resolved when the application
    // has finished starting up.

    // Load our config.js file from the local file system.
    return config.load(options.config).then(function () {
        // Initialise the models
        return models.init();
    }).then(function () {
        // Initialize data
        return data.init();
    }).then(function () {
        // Initialize socket.io
        return api.init();
    }).then(function () {
        // ##Configuration the express
        var logging  = config.logging;

        // enabled gzip compression by default
        if (compress !== false) {
            app.use(compress());
        }

        // Logging configuration
        if (logging !== false) {
            if (app.get('env') !== 'development') {
                app.use(logger('combined', logging));
            } else {
                app.use(logger('dev', logging));
            }
        }

        // one year
        app.use('/', express.static(path.join(config.corePath, '/client'), {maxAge: ONE_DAY_MS}));
        // Add in all trailing slashes
        app.use(slashes(true));

        return new Server(app);
    });
}

module.exports = init;
