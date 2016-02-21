// # Schema

module.exports = {
    // ## table structure for dynamo db
    tweets: {
        TableName: 'Tweets',
        KeySchema: [
            {AttributeName: 'place', KeyType: 'HASH'},  // Partition key
            {AttributeName: 'id', KeyType: 'RANGE'}  // Sort key
        ],
        AttributeDefinitions: [
            {AttributeName: 'place', AttributeType: 'S'},
            {AttributeName: 'id', AttributeType: 'N'}
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
        }
    }
};
