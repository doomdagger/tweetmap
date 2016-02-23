// # Twitter Streaming API
// keep writing data into dynamodb

var Promise = require('bluebird'),

    models = require('../models'),
    errors = require('../errors');

function init() {
    var twit = exports.twit = require('./twit');

    twit.channel.on('tweet', function (rawObj) {
        // only store tweets with locations
        if (!!rawObj.coordinates && !!rawObj.place) {
            models.Tweets.uniqueInsert(new models.Tweet(rawObj)).catch(function (error) {
                errors.logError(error, 'data module is in a process of streaming data to dynamodb',
                    'https://github.com/aws/aws-sdk-js/issues/862');
            });
        }
    });

    return Promise.resolve();
}

exports.init = init;

// Data exports [init, twit (with single channel)]
