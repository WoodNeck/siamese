/* eslint-disable @typescript-eslint/naming-convention */
import * as uuid from "uuid";
import Discord from "discord.js";

import Siamese from "~/Siamese";
import { params as channelParams } from "~/table/channel";

export default async (bot: Siamese, channel: Discord.TextChannel) => {
  const db = bot.database;

  if (!db) return null;

  const randId = uuid.v4();

  return db.query({
    KeyConditionExpression: "channelID = :channelID AND randID < :randID",
    ExpressionAttributeValues: {
      ":channelID": { "S": channel.id },
      ":randID": { "S": randId }
    },
    Limit: 1,
    TableName: channelParams.TableName
  }).promise().then(res => {
    if (res.Count && res.Count > 0) return res.Items![0];

    // Retry with uuid >= :uuid
    return db.query({
      KeyConditionExpression: "channelID = :channelID AND randID >= :randID",
      ExpressionAttributeValues: {
        ":channelID": { "S": channel.id },
        ":randID": { "S": randId }
      },
      Limit: 1,
      TableName: channelParams.TableName
    }).promise().then(result => {
      if (result.Count && result.Count > 0) return result.Items![0];
      return null;
    });
  });
};
