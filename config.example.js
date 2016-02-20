// # tweetmap Configuration
// Setup your tweetmap install for various environments

// tweetmap runs in `development` mode by default.

var path = require('path'),
    config;

config = {
    // ### Production
    // When running tweetmap in the wild, use the production environment.
    // Configure your URL and confidential settings here
    production: {
        url: 'http://my-tweetmap.com',

        server: {
            host: '127.0.0.1',
            port: '1222'
        },

        websocket: {
            port: '3113'
        },

        aws: {
            apiVersion: '2016-02-19'
        },

        twitter: {
            consumer_key: 'ATBHdskAbAzEbXRs9qXPrZek5',
            consumer_secret: 'U8OzaisdkeffFBPbbsz02fUwYdCgVCl3hradRKkM7vdlN3EiLt',
            access_token: '699071431536152580-ms8sCg02vk3OyNqKJfHqHsKYPChkkfB',
            access_token_secret: 'GY4rgv6ImIgjyKC79lXFQK43yN9Btdqk0YZa6xFaGTTKf',
            timeout_ms: 60 * 1000
        }
    },

    // ### Development **(default)**
    development: {
        // The url to use when providing links to the site.
        url: 'http://localhost:1222',

        // #### Server
        // Can be host & port (default), or socket
        server: {
            // Host to be passed to node's `net.Server#listen()`
            host: '127.0.0.1',
            // Port to be passed to node's `net.Server#listen()`
            port: '1222'
        },

        // ### Websocket
        websocket: {
            // Port to be passed to socket.io's `io#listen()`
            port: '3113'
        },

        // ### AWS configuration
        aws: {
            // API versions locking
            apiVersion: '2016-02-19'
        },

        // ### Twitter Stream API configuration
        twitter: {
            // Application Credentials (Readonly)
            consumer_key: 'ATBHdskAbAzEbXRs9qXPrZek5',
            consumer_secret: 'U8OzaisdkeffFBPbbsz02fUwYdCgVCl3hradRKkM7vdlN3EiLt',
            access_token: '699071431536152580-ms8sCg02vk3OyNqKJfHqHsKYPChkkfB',
            access_token_secret: 'GY4rgv6ImIgjyKC79lXFQK43yN9Btdqk0YZa6xFaGTTKf',
            // optional HTTP request timeout to apply to all requests.
            timeout_ms: 60 * 1000
        },

        logging: true
    }
};

module.exports = config;
