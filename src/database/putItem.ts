/* eslint-disable @typescript-eslint/naming-convention */
import Siamese from "~/Siamese";

export default async (bot: Siamese, tableName: string, items: {[key: string]: string | number}) => {
  const db = bot.database;

  if (!db) return null;

  const formattedItems = items as unknown as {[key: string]: { S: string } | { N: string }};

  for (const key in items) {
    const val = items[key];

    if (typeof val === "string") {
      formattedItems[key] = { S: val };
    } else {
      formattedItems[key] = { N: val.toString() };
    }
  }

  return db.putItem({
    Item: formattedItems,
    TableName: tableName
  }).promise();
};
