var _ = require('lodash');

var config = require('../server/config');
process.env.NODE_ENV = "development";
config.load().then(function () {
    var models = require('../server/models');

    models.init().then(function () {
        console.log("table initialized!");

        var t = {
            id: '701194859235950594',
            text: 'Cleared: Incident on #ToLine from World Trade Center Station to Newark Station',
            user:
            { id: '50706690',
                name: '511 New York',
                profile_image_url: 'http://pbs.twimg.com/profile_images/307131779/511twitlogo_normal.png' },
            coordinates: { type: 'Point', coordinates: [ '40.712066', '-74.010009' ] },
            place: '4d25f30d2fbf1463',
            timestamp_ms: '1456012856669'
        };
        var tweet = new models.Tweet();
        _.extend(tweet, t);

        return models.Tweets.uniqueInsert(tweet);

    }).then(function (data) {
        console.log(data);
    }).catch(function (error) {
        console.log(error)
    });
});