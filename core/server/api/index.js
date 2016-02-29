// # API module
// define routing rules for websocket
var Promise = require('bluebird'),
    _ = require('lodash'),

    pageSize = 50;

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
                from = page * pageSize;

            // if it is not an array, make it an array
            if (!_.isArray(keywords)) {
                keywords = [keywords];
            }
            // start search
            es.search({
                from: from,
                size: pageSize,
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
                from = page * pageSize;

            // start search
            es.search({
                from: from,
                size: pageSize,
                body: {
                    query: {
                        match_all: {}
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
                from: 0,
                size: 100,
                body: {
                    query: {
                        filtered: {
                            query: {
                                match_all: {}
                            },
                            filter: {
                                geo_bounding_box: {
                                    'location.coordinates': {
                                        top_left: ops.coordinates[0],
                                        bottom_right: ops.coordinates[1]
                                    }
                                }
                            }
                        }
                    }
                }
            }).then(function (resp) {
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
