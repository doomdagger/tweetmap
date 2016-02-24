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
    if (!!rawObj) {
        this.tweet_id = rawObj.id_str;
        this.place_id = rawObj.place.id;
        this.user_id = rawObj.user.id_str;
        this.text = rawObj.text;
        this.username = rawObj.user.screen_name;
        this.user_profile_image = rawObj.user.profile_image_url;
        this.coordinates = [rawObj.coordinates.coordinates[0].toString(), rawObj.coordinates.coordinates[1].toString()];
        this.timestamp_ms = rawObj.timestamp_ms;
    }
};

// @TODO better ways instead of hard-coding?
Tweet.prototype.serialize = function () {
    var self = this;
    return {
        tweet_id: {S: self.tweet_id},
        place_id: {S: self.place_id},
        user_id: {S: self.user_id},
        text: {S: self.text},
        username: {S: self.username},
        user_profile_image: {S: self.user_profile_image},
        coordinates: {NS: self.coordinates},
        timestamp_ms: {N: self.timestamp_ms}
    };
};

// Tweets Object
Tweets = {
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
            ConditionExpression: 'attribute_not_exists(place_id) AND attribute_not_exists(tweet_id)'
        }).catch(function (error) {
            if (error.code === 'ConditionalCheckFailedException') {
                errors.logWarn('data', 'duplicate data insertion occurs, with place ('
                    + tweet.place_id + ') and id (' + tweet.tweet_id + ')');
                return;
            }
            // throw any other errors
            return Promise.reject(error);
        });
    }
};

exports.Tweet = Tweet;
exports.Tweets = Tweets;
