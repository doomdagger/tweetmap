var config = require('../server/config');
process.env.NODE_ENV = "development";
config.load().then(function () {
    var models = require('../server/models');

    models.init().then(function () {
        console.log("table initialized!");
    }).catch(function (error) {
        console.log(error)
    });
});