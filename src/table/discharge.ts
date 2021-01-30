/* eslint-disable @typescript-eslint/naming-convention */
import AWS from "aws-sdk";

export const params: AWS.DynamoDB.CreateTableInput = {
  TableName : "Discharge",
  KeySchema: [
    { AttributeName: "guildID", KeyType: "HASH"},
    { AttributeName: "userName", KeyType: "RANGE" }
  ],
  AttributeDefinitions: [
    { AttributeName: "guildID", AttributeType: "S" },
    { AttributeName: "userName", AttributeType: "S" }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  }
};
