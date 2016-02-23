// # DynamoDB
// expose global dynamo db object here, because aws sdk won't send out http request
// until the real function call on dynamo db object, we can safely initialize dynamo db
// object without using Promise

var https = require('https'),
    AWS = require('aws-sdk'),
    _ = require('lodash'),
    Promise = require('bluebird'),

    config = require('../config'),

    dynamodb;

// ## AWS global configuration
// using configuration in `config.js` and credentials information in user home directory
_.extend(AWS.config, config.aws);

// get the instance
dynamodb = new AWS.DynamoDB({
    httpOptions: {
        agent: new https.Agent({
            ciphers: 'ALL',
            secureProtocol: 'TLSv1_method'
        })
    }
});

// promisify all functions in dynamo db
Promise.promisifyAll(Object.getPrototypeOf(dynamodb));

module.exports = dynamodb;
