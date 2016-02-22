// # Twitter Streaming API
// keep writing data into dynamodb

var Promise = require('bluebird'),

    models = require('../models');

function init() {
    var twit = exports.twit = require('./twit');

    twit.channel.on('tweet', function (rawObj) {
        // only store tweets with locations
        if (!!rawObj.coordinates && !!rawObj.place) {
            models.Tweets.uniqueInsert(new models.Tweet(rawObj));
        }
    });

    return Promise.resolve();
}

exports.init = init;

// Data exports [init, twit (with single channel)]
