// # Tweet model
// table attributes for tweet model, with its access operations

var Promise = require('bluebird'),

    dynamodb = require('./base'),
    errors = require('../errors'),
    tableName = require('./schema').tweets.TableName,

    Tweet,
    Tweets;

/**
 * Tweet object
 * @param {Object} rawObj
 * @constructor
 */
Tweet = function Tweet(rawObj) {
    if (rawObj) {
        this.id = rawObj.id_str;
        this.text = rawObj.text;
        this.user = {
            id: rawObj.user.id_str,
            name: rawObj.user.name,
            profile_image_url: rawObj.user.profile_image_url || ''
        };
        this.coordinates = {
            type: rawObj.coordinates.type,
            coordinates: [rawObj.coordinates.coordinates[0].toString(), rawObj.coordinates.coordinates[1].toString()]
        };
        this.place = rawObj.place.id;
        this.timestamp_ms = rawObj.timestamp_ms;
    }
};

// @TODO better ways instead of hard-coding?

Tweet.prototype.serialize = function () {
    var self = this;
    return {
        id: {N: self.id},
        text: {S: self.text},
        user: {
            M: {
                id: {N: self.user.id},
                name: {S: self.user.name},
                profile_image_url: {S: self.user.profile_image_url}
            }
        },
        coordinates: {
            M: {
                type: {S: self.coordinates.type},
                coordinates: {NS: self.coordinates.coordinates}
            }
        },
        place: {S: self.place},
        timestamp_ms: {N: self.timestamp_ms}
    };
};

// @TODO better ways instead of hard-coding?

Tweet.prototype.unserialize = function (dbObj) {
    this.id = dbObj.id.N;
    this.text = dbObj.text.S;
    this.user = {
        id: dbObj.user.M.id.N,
        name: dbObj.user.M.name.S,
        profile_image_url: dbObj.user.M.profile_image_url.S
    };
    this.coordinates = {
        type: dbObj.coordinates.M.type.S,
        coordinates: dbObj.coordinates.M.coordinates.NS
    };
    this.place = dbObj.place.S;
    this.timestamp_ms = dbObj.timestamp_ms.N;
};

Tweets = {
    /**
     * find on with place and id specified
     * @param {String} place
     * @param {Number} id
     * @returns {*}
     */
    findOne: function (place, id) {
        return dynamodb.getItemAsync({
            Key: {
                place: {S: place},
                id: {N: id}
            },
            TableName: tableName
        }).then(function (data) {
            var tweet = new Tweet();
            tweet.unserialize(data);
            return tweet;
        });
    },

    /**
     * won't insert two tweets have same place and id attributes
     * @param {Tweet} tweet
     * @returns {*}
     */
    uniqueInsert: function (tweet) {
        return dynamodb.putItemAsync({
            Item: tweet.serialize(),
            TableName: tableName,
            // ensure unique insertion
            ConditionExpression: 'attribute_not_exists(place) AND attribute_not_exists(id)'
        }).catch(function (error) {
            if (error.code === 'ConditionalCheckFailedException') {
                errors.logWarn('data', 'duplicate data insertion occurs, with place ('
                    + tweet.place + ') and id (' + tweet.id + ')');
                return;
            }
            // throw any other errors
            return Promise.reject(error);
        });
    }
};

exports.Tweet = Tweet;
exports.Tweets = Tweets;
