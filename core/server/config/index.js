// # Config
// General entry point for all configuration data
var path          = require('path'),
    Promise       = require('bluebird'),
    fs            = require('fs'),
    _             = require('lodash'),

    validator     = require('validator'),
    errors        = require('../errors'),
    packageInfo   = require('../../../package.json'),
    appRoot       = path.resolve(__dirname, '../../../'),
    corePath      = path.resolve(appRoot, 'core/'),
    defaultConfig = {};

function ConfigManager(config) {
    /**
     * Our internal true representation of our current config object.
     * @private
     * @type {Object}
     */
    this._config = {};

    // If we're given an initial config object then we can set it.
    if (config && _.isObject(config)) {
        this.set(config);
    }
}

ConfigManager.prototype.init = function (rawConfig) {
    var self = this;

    // Cache the config.js object's environment
    // object so we can later refer to it.
    // Note: this is not the entirety of config.js,
    // just the object appropriate for this NODE_ENV
    self.set(rawConfig);

    return Promise.resolve(self._config);
};

/**
 * Allows you to set the config object.
 * @param {Object} config Only accepts an object at the moment.
 */
ConfigManager.prototype.set = function (config) {
    // Merge passed in config object onto our existing config object.
    // We're using merge here as it doesn't assign `undefined` properties
    // onto our cached config object.  This allows us to only update our
    // local copy with properties that have been explicitly set.
    _.merge(this._config, config);

    // Protect against accessing a non-existant object.
    // This ensures there's always at least a paths object
    // because it's referenced in multiple places.
    this._config.paths = this._config.paths || {};

    _.merge(this._config, {
        appVersion: packageInfo.version,
        paths: {
            appRoot:          appRoot,
            config:           this._config.paths.config || path.join(appRoot, 'config.js'),
            configExample:    path.join(appRoot, 'config.example.js'),
            corePath:         corePath
        }
    });

    // copy the current state of this._config, so it's directly accessible on the instance.
    _.extend(this, this._config);
};

/**
 * Allows you to read the config object.
 * @return {Object} The config object.
 */
ConfigManager.prototype.get = function () {
    return this._config;
};

ConfigManager.prototype.load = function (configFilePath) {
    var self = this;

    self._config.paths.config = configFilePath || self._config.paths.config;

    /* Check for config file and copy from config.example.js
     if one doesn't exist. After that, start the server. */
    return new Promise(function (resolve, reject) {
        fs.stat(self._config.paths.config, function (err) {
            var exists = (err) ? false : true,
                pendingConfig;

            if (!exists) {
                pendingConfig = self.writeFile();
            }

            Promise.resolve(pendingConfig).then(function () {
                return self.validate();
            }).then(function (rawConfig) {
                resolve(self.init(rawConfig));
            }).catch(reject);
        });
    });
};

/* Check for config file and copy from config.example.js
 if one doesn't exist. After that, start the server. */
ConfigManager.prototype.writeFile = function () {
    var configPath = this._config.paths.config,
        configExamplePath = this._config.paths.configExample;

    return new Promise(function (resolve, reject) {
        fs.stat(configExamplePath, function checkTemplate(err) {
            var templateExists = (err) ? false : true,
                read,
                write,
                error;

            if (!templateExists) {
                error = new Error('Could not locate a configuration file.');
                error.context = appRoot;
                error.help = 'Please check your deployment for config.js or config.example.js.';

                return reject(error);
            }

            // Copy config.example.js => config.js
            read = fs.createReadStream(configExamplePath);
            read.on('error', function (err) {
                errors.logError(
                    new Error('Could not open config.example.js for read.'),
                    appRoot,
                    'Please check your deployment for config.js or config.example.js.');

                reject(err);
            });

            write = fs.createWriteStream(configPath);
            write.on('error', function (err) {
                errors.logError(
                    new Error('Could not open config.js for write.'),
                    appRoot,
                    'Please check your deployment for config.js or config.example.js.');

                reject(err);
            });

            write.on('finish', resolve);

            read.pipe(write);
        });
    });
};

/**
 * Read config.js file from file system using node's require
 * @param  {String} envVal Which environment we're in.
 * @return {Object}        The config object.
 */
ConfigManager.prototype.readFile = function (envVal) {
    return require(this._config.paths.config)[envVal];
};

/**
 * Validates the config object has everything we want and in the form we want.
 * @return {Promise.<Object>} Returns a promise that resolves to the config object.
 */
ConfigManager.prototype.validate = function () {
    var envVal = process.env.NODE_ENV || undefined,
        hasHostAndPort,
        hasSocket,
        config;

    try {
        config = this.readFile(envVal);
    }
    catch (e) {
        return Promise.reject(e);
    }

    // Check that our url is valid
    if (!validator.isURL(config.url, {protocols: ['http', 'https'], require_protocol: true})) {
        errors.logError(
            new Error('Your site url in config.js is invalid.'),
                config.url,
                'Please make sure this is a valid url before restarting');

        return Promise.reject(new Error('invalid site url'));
    }

    hasHostAndPort = config.server && !!config.server.host && !!config.server.port;
    hasSocket = config.server && !!config.server.socket;

    // Check for valid server host and port values
    if (!config.server || !(hasHostAndPort || hasSocket)) {
        errors.logError(
            new Error('Your server values (socket, or host and port) in config.js are invalid.'),
            JSON.stringify(config.server),
            'Please provide them before restarting.');

        return Promise.reject(new Error('invalid server configuration'));
    }

    return Promise.resolve(config);
};

module.exports = new ConfigManager(defaultConfig);
