// # Tweet model
// table attributes for tweet model, with its access operations

var Promise = require('bluebird'),

    config = require('../config'),
    dynamodb = require('./base'),
    tableName = require('./schema')['tweets'].TableName,

    Tweet,
    Tweets;

/**
 * Tweet object
 * @param rawObj
 * @constructor
 */
Tweet = function Tweet(rawObj) {
    if (rawObj) {
        this.id = rawObj.id;
        this.text = rawObj.text;
        this.user = {
            id: rawObj.user.id,
            name: rawObj.user.name,
            description: rawObj.user.description,
            profile_image_url: rawObj.user.profile_image_url
        };
        this.coordinates = {
            type: rawObj.coordinates.type,
            coordinates: rawObj.coordinates.coordinates
        };
        this.place = rawObj.place.id;
        this.timestamp_ms = rawObj.timestamp_ms;
    }
};

//@TODO better ways instead of hard-coding?
Tweet.prototype.serialize = function () {
    var self = this;
    return {
        id: {N: self.id},
        text: {S: self.text},
        user: {
            M: {
                id: {N: self.user.id},
                name: {S: self.user.name},
                description: {S: self.user.description},
                profile_image_url: {S: self.user.profile_image_url}
            }
        },
        coordinates: {
            M: {
                type: {S: self.coordinates.type},
                coordinates: {NS: self.coordinates.coordinates}
            }
        },
        place: {N: self.place},
        timestamp_ms: {N: self.timestamp_ms}
    };
};

//@TODO better ways instead of hard-coding?
Tweet.prototype.unserialize = function (dbObj) {
    this.id = dbObj.id.N;
    this.text = dbObj.text.S;
    this.user = {
        id: dbObj.user.M.id.N,
        name: dbObj.user.M.name.S,
        description: dbObj.user.M.description.S,
        profile_image_url: dbObj.user.M.profile_image_url.S
    };
    this.coordinates = {
        type: dbObj.coordinates.M.type.S,
        coordinates: dbObj.coordinates.M.coordinates.NS
    };
    this.place = dbObj.place.N;
    this.timestamp_ms = dbObj.timestamp_ms.N;
};

Tweets = {
    'exist': function (place, id) {
        return new Promise(function (resolve, reject) {
            dynamodb.getItem({
                Key: {
                    /* required */
                    place: {
                        /* AttributeValue */
                        N: place
                    },
                    id: {
                        N: id
                    }
                },
                TableName: tableName, /* required */
                ProjectionExpression: 'place, id'
            }, function (err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else     console.log(data);           // successful response
                resolve();
            });
        });
    },

    'findOne': function (place, id) {
        return dynamodb.getItemAsync({
            Key: {
                place: {N: place},
                id: {N: id}
            },
            TableName: tableName /* required */
        }).then(function (data) {
            var tweet = new Tweet();
            tweet.unserialize(data);
            return tweet;
        });
    },

    'upsert': function (tweet) {
        return dynamodb.putItemAsync({
            Item: tweet.serialize(),
            TableName: tableName, /* required */
            ConditionExpression: 'attribute_not_exists(place) AND attribute_not_exists(id)'
        });
    }
};

exports.Tweet = Tweet;
exports.Tweets = Tweets;