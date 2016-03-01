/**
 * Created by lihe on 2/23/16.
 */

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'search-tweetmap-pzchrvnjsct6seu5gckuh74amy.us-west-2.es.amazonaws.com',
    port: '443',
    ssl: true
});

client.search({
    from: 0,
    size: 100,
    body: {
        query: {
            geo_shape: {
                location: {
                    shape: {
                        type: 'envelope',
                        coordinates: [[110, 26],[120, 20]]
                    }
                }
            }
        }
    }
}).then(function (resp) {
    var hits = resp.hits.hits;
    console.log(hits);
}, function (err) {
    console.trace(err.message);
});