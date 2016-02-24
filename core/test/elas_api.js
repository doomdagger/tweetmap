///**
// * Created by lihe on 2/23/16.
// */
//
//var elasticsearch = require('elasticsearch');
//var client = new elasticsearch.Client({
//    host: 'search-tweetmap-pzchrvnjsct6seu5gckuh74amy.us-west-2.es.amazonaws.com',
//    port: '443',
//    ssl: true
//});
//
//client.search({
//    body: {
//        query: {
//            query_string : {
//                default_field : "text",
//                query : "Bangkok OR am"
//            }
//        }
//    },
//    pretty: ''
//}).then(function (resp) {
//    var hits = resp.hits.hits;
//    console.log(hits)
//}, function (err) {
//    console.trace(err.message);
//});

console.log(['1','2','3'].join(' OR '));