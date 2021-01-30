/* eslint-disable @typescript-eslint/naming-convention */
import AWS from "aws-sdk";

export default async (
  database: AWS.DynamoDB,
  params: AWS.DynamoDB.CreateTableInput
) => database.describeTable({ TableName: params.TableName }).promise()
  .catch(() => database.createTable(params).promise())
  .catch(console.error);
