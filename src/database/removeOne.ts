/* eslint-disable @typescript-eslint/naming-convention */
import { DynamoDB } from "aws-sdk";

import Siamese from "~/Siamese";

export default async (bot: Siamese, tableName: string, keys: DynamoDB.Key) => {
  const db = bot.database;

  if (!db) return null;

  return db.deleteItem({
    Key: keys,
    TableName: tableName
  }).promise();
};
