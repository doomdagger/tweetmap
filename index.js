// # tweetmap Startup
// Orchestrates the startup of tweetmap when run from command line.
var tweetmap,
    errors;

// Proceed with startup
tweetmap = require('./core');
errors = require('./core/server/errors');

// Call tweetmap to get an instance of tweetmap server
tweetmap().then(function (server) {
    // Let tweetmap handle starting our server instance.
    server.start();
}).catch(function (err) {
    errors.logErrorAndExit(err, err.context, err.help);
});