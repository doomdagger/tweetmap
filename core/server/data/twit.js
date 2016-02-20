// # Twit singleton
// initialize twit using given auth configuration in `config.js`

var Twit = require('twit'),

    config = require('../config'),

    twit = new Twit(config.twitter.auth);

// ## singleton channel for our application, let twit manage it.
twit.channel = twit.stream('statuses/filter', {track: config.twitter.keywords});

module.exports = twit;
