/* eslint-disable @typescript-eslint/naming-convention */
import AWS from "aws-sdk";

export const params: AWS.DynamoDB.CreateTableInput = {
  TableName : "Channel",
  KeySchema: [
    { AttributeName: "channel_id", KeyType: "HASH"},
    { AttributeName: "rand_id", KeyType: "RANGE" }
  ],
  AttributeDefinitions: [
    { AttributeName: "channel_id", AttributeType: "S" },
    { AttributeName: "rand_id", AttributeType: "S" }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  }
};
