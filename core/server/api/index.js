// # API module
// define routing rules for websocket
var Promise = require('bluebird'),
    _ = require('lodash');

function init() {
    var es = exports.es = require('./es');

    // use closure here
    exports.routing = function (socket) {
        socket.on('search keywords', function (keywords) {
            if (!_.isArray(keywords)) {
                keywords = [keywords];
            }
            es.search({
                body: {
                    query: {
                        query_string: {
                            default_field: 'text',
                            query: keywords.join(' OR ')
                        }
                    }
                }
            }).then(function (resp) {
                socket.emit('keywords search', resp.hits.hits);
            }, function (err) {
                socket.emit('error', err);
            });
        });
    };

    return Promise.resolve();
}

exports.init = init;
