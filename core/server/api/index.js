// # API module
// define routing rules for websocket
var Promise = require('bluebird'),
    _ = require('lodash'),

    page_size = 50;

function init() {
    var es = exports.es = require('./es');

    // use closure here
    exports.routing = function (socket) {
        /**
         * ops object
         * {
         *  page: Number
         *  keywords: [String, String, ...]
         * }
         */
        socket.on('search keywords', function (ops) {
            // in case of undefined
            var options = ops || {},
                page = options.page || 0,
                keywords = options.keywords || [],
                // page configuration
                from = page * page_size;

            // if it is not an array, make it an array
            if (!_.isArray(keywords)) {
                keywords = [keywords];
            }
            // start search
            es.search({
                from: from,
                size: page_size,
                body: {
                    query: {
                        query_string: {
                            default_field: 'text',
                            query: keywords.join(' OR ')
                        }
                    }
                }
            }).then(function (resp) {
                // fetch source data, emit back
                var tweets = resp.hits.hits;
                tweets = _.map(tweets, function (tweet) {
                    return tweet._source;
                });
                socket.emit('keywords search', tweets);
            }, function (err) {
                socket.emit('error', err);
            });
        });

        /**
         * ops object
         * {
         *  page: Number
         * }
         */
        socket.on('search all', function (ops) {
            // in case of undefined
            var options = ops || {},
                page = options.page || 0,
            // page configuration
                from = page * page_size;

            // start search
            es.search({
                from: from,
                size: page_size,
                body: {
                    query : {
                        match_all : {}
                    }
                }
            }).then(function (resp) {
                // fetch source data, emit back
                var tweets = resp.hits.hits;
                tweets = _.map(tweets, function (tweet) {
                    return tweet._source;
                });
                socket.emit('all search', tweets);
            }, function (err) {
                socket.emit('error', err);
            });
        });

        /**
         * ops object
         * {
         *  coordinates: [[left_up_point][right_down_point]]
         * }
         */
        socket.on('search geo', function (ops) {
            if (!ops || !ops.coordinates) {
                socket.emit('error', new Error('no coordinates specified'));
            }
            if (!_.isArray(ops.coordinates) || ops.coordinates.length !== 2) {
                socket.emit('error', new Error('invalid coordinates format'));
            }
            // start search
            es.search({
                body: {
                    query: {
                        geo_shape: {
                            location: {
                                shape: {
                                    type: 'envelope',
                                    coordinates: ops.coordinates
                                }
                            }
                        }
                    }
                }
            }).then(function (resp) {
                console.log('here');

                // fetch source data, emit back
                var tweets = resp.hits.hits;
                tweets = _.map(tweets, function (tweet) {
                    return tweet._source;
                });
                socket.emit('geo search', tweets);
            }, function (err) {
                socket.emit('error', err);
            });
        });
    };

    return Promise.resolve();
}

exports.init = init;
