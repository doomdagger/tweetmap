/**
 * Created by lihe on 2/19/16.
 */

var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2",
    accessKeyId: "AKIAJGQRH6BB352BJGQQ",
    secretAccessKey: "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",
    sslEnabled: true,
    maxRetries: 6,
    logger: process.stdout
});

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "Movies",
    KeySchema: [
        { AttributeName: "year", KeyType: "HASH"},  //Partition key
        { AttributeName: "title", KeyType: "RANGE" }  //Sort key
    ],
    AttributeDefinitions: [
        { AttributeName: "year", AttributeType: "N" },
        { AttributeName: "title", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});