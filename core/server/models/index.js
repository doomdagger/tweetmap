// # Model module
// expose all models, init schema structure
// tweetmap won't reset database if some tables have already been populated
// for those already being created tables, we simply skip them.

var Promise = require('bluebird'),
    _ = require('lodash'),

    errors = require('../errors'),
    schema = require('./schema');

function init() {
    // lazy require to wait for configuration initialization
    var dynamodb = exports.dynamodb = require('./base'),
        promises;

    /**
     * init table if it does not exist, swallow useless errors thrown by aws-sdk,
     * like `ResourceNotFoundException`, use it as a flag instead to tell whether
     * we should create the table or not
     * @param {Object} table
     * @returns {*}
     */
    function initTable(table) {
        // param object needed for describe table function
        var tableInfo = {
            TableName: table.TableName
        };

        return dynamodb.describeTableAsync(tableInfo).then(function () {
            // no errors, table must exist! return true
            errors.logInfo('models', 'table named ' + table.TableName + ' already exists! Skip...');
            return true;
        }, function (error) {
            // have errors, check error code, reject any other types of errors except
            // `ResourceNotFoundException`
            if (error.code === 'ResourceNotFoundException') {
                // table does not! return false
                errors.logInfo('models', 'table named ' + table.TableName + ' does not exist! Creating...');
                return false;
            }
            // unknown error, reject it
            return Promise.reject(error);
        }).then(function (exist) {
            if (!exist) {
                return dynamodb.createTableAsync(table);
            }
        });
    }

    // start to sequence promises
    promises = _.transform(schema, function (result, value, key) {
        // expose all models
        _.extend(exports, require('./' + key));
        // initialize all tables
        result.push(initTable(value));
    }, []);

    return Promise.all(promises);
}

exports.init = init;

// Model exports [init, dynamodb, several models...]
