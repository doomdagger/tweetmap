// # tweetmap Startup
// Orchestrates the startup of tweetmap when run from command line.
var express,
    tweetmap,
    errors;

// Proceed with startup
express = require('express');
tweetmap = require('./core');
errors = require('./core/server/errors');

// Call tweetmap to get an instance of tweetmap server
tweetmap().then(function (server) {
    // Let tweetmap handle starting our server instance.
    server.start();
}).catch(function (err) {
    errors.logErrorAndExit(err, err.context, err.help);
});
