/**
 * Created by lihe on 2/19/16.
 */

var Twit = require('twit');

var twit = new Twit({
    consumer_key:         'ATBHdskAbAzEbXRs9qXPrZek5',
    consumer_secret:      'U8OzaisdkeffFBPbbsz02fUwYdCgVCl3hradRKkM7vdlN3EiLt',
    access_token:         '699071431536152580-ms8sCg02vk3OyNqKJfHqHsKYPChkkfB',
    access_token_secret:  'GY4rgv6ImIgjyKC79lXFQK43yN9Btdqk0YZa6xFaGTTKf',
    timeout_ms:           60*1000  // optional HTTP request timeout to apply to all requests.
});

//var stream = twit.stream('statuses/firehose');
var stream = twit.stream('statuses/filter', {track: ["sport","love","food","job","game","business","book","education","family"]});

stream.on('tweet', function (tweet) {
    if (tweet.coordinates) {
        console.log(tweet);
    }
});

stream.on('disconnect', function (disconnectMessage) {
    console.log('disconnected?');
});

stream.on('connected', function () {
    console.log('connected!');
});

stream.on('connect', function () {
    console.log('try connecting!');
});

stream.on('error', function (message) {
    console.log(message);
});
