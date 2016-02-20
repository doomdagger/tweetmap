// # Twitter Streaming API
// keep writing data into dynamodb

var Promise = require('bluebird'),

    config = require('../config'),
    models = require('../models');

function init() {
    var twit = exports.twit = require('./twit');

    twit.channel.on('tweet', function (rawObj) {
        // only store tweets with locations
        if (!!rawObj.coordinates) {
            var tweet = new models.Tweet(rawObj);
            console.log(tweet.serialize());
        }
    });

    return Promise.resolve();
}

exports.init = init;

// Data exports [init, twit (with single channel)]