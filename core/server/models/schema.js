// # Schema

module.exports = {
    // ## table structure for dynamo db
    tweets: {
        TableName: 'Tweets',
        KeySchema: [
            {AttributeName: 'place_id', KeyType: 'HASH'},  // Partition key
            {AttributeName: 'tweet_id', KeyType: 'RANGE'}  // Sort key
        ],
        AttributeDefinitions: [
            {AttributeName: 'place_id', AttributeType: 'S'},
            {AttributeName: 'tweet_id', AttributeType: 'S'}
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
        }
    }
};
