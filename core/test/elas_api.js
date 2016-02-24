/**
 * Created by lihe on 2/23/16.
 */

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'search-tweetmap-pzchrvnjsct6seu5gckuh74amy.us-west-2.es.amazonaws.com',
    port: '443',
    ssl: true,
    log: 'trace'
});

client.search({
    index: 'tweets-2016.02.23',
    type: 'logs',
    q: 'text:am',
    pretty: ''
}).then(function (resp) {
    var hits = resp.hits.hits;
}, function (err) {
    console.trace(err.message);
});