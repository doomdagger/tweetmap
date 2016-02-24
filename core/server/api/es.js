// # AWS ES
// we expose es singleton here

var elasticsearch = require('elasticsearch'),

    config = require('../config'),

    es;

// use configuration from config module
es = new elasticsearch.Client(config.es);

// expose es
module.exports = es;