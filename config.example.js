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

        aws: {
            region: 'us-west-2',
            apiVersion: '2016-02-19'
        },

        twitter: {
            auth: {
                consumer_key: 'ATBHdskAbAzEbXRs9qXPrZek5',
                consumer_secret: 'U8OzaisdkeffFBPbbsz02fUwYdCgVCl3hradRKkM7vdlN3EiLt',
                access_token: '699071431536152580-ms8sCg02vk3OyNqKJfHqHsKYPChkkfB',
                access_token_secret: 'GY4rgv6ImIgjyKC79lXFQK43yN9Btdqk0YZa6xFaGTTKf',
                timeout_ms: 60 * 1000
            },
            keywords: ['the', 'a', 'they', 'an', 'this', 'of', 'on', 'for',
                'and', 'at', 'is', 'am', 'are', 'from', 'it', 'to']
        }
    },

    // ### Development **(default)**
    development: {
        // The url to use when providing links to the site.
        url: 'http://localhost:1222',

        // #### Server
        // Can be host & port (default)
        server: {
            // Host to be passed to node's `net.Server#listen()`
            host: '127.0.0.1',
            // Port to be passed to node's `net.Server#listen()`
            port: '1222'
        },

        // ### AWS configuration
        aws: {
            // choose your own region, default settings in home directory doesn't work
            region: 'us-west-2',
            // API versions locking
            apiVersion: '2016-02-19'
        },

        // ### Twitter Stream API configuration
        twitter: {
            // Application Credentials (Readonly)
            auth: {
                consumer_key: 'ATBHdskAbAzEbXRs9qXPrZek5',
                consumer_secret: 'U8OzaisdkeffFBPbbsz02fUwYdCgVCl3hradRKkM7vdlN3EiLt',
                access_token: '699071431536152580-ms8sCg02vk3OyNqKJfHqHsKYPChkkfB',
                access_token_secret: 'GY4rgv6ImIgjyKC79lXFQK43yN9Btdqk0YZa6xFaGTTKf',
                // optional HTTP request timeout to apply to all requests.
                timeout_ms: 60 * 1000
            },
            // keywords to filter
            keywords: ['the', 'a', 'they', 'an', 'this', 'of', 'on', 'for',
                'and', 'at', 'is', 'am', 'are', 'from', 'it', 'to']
        },

        logging: true
    }
};

module.exports = config;
