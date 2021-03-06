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
            host: '0.0.0.0',
            port: '80'
        },

        // stop trying to use the access key, they are all revoked!!!
        aws: {
            accessKeyId: 'AKIAJGQRH6BB352BJGQQ',
            secretAccessKey: '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',
            region: 'us-west-2',
            apiVersion: '2016-02-19',
            sslEnabled: true
        },
        // stop trying to use the access key, they are all revoked!!!
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
        },

        es: {
            host: 'search-tweetmap-pzchrvnjsct6seu5gckuh74amy.us-west-2.es.amazonaws.com',
            port: '443',
            ssl: true
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
            host: '0.0.0.0',
            // Port to be passed to node's `net.Server#listen()`
            port: process.env.PORT || '1222'
        },
        // stop trying to use the access key, they are all revoked!!!
        // ### AWS configuration
        aws: {
            // credentials
            accessKeyId: 'AKIAJGQRH6BB352BJGQQ',
            secretAccessKey: '61tvHxCspVqFnwRgSUXES2rfOnpMC9efrRoQ3aKE',
            // choose your own region, default settings in home directory doesn't work
            region: 'us-west-2',
            // API versions locking
            apiVersion: '2016-02-19',
            sslEnabled: true
        },
        // stop trying to use the access key, they are all revoked!!!
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

        // ### Elastic search configuration
        es: {
            // AWS ES endpoint
            host: 'search-tweetmap-pzchrvnjsct6seu5gckuh74amy.us-west-2.es.amazonaws.com',
            // use https by default
            port: '443',
            ssl: true
        },

        logging: true
    }
};

module.exports = config;
