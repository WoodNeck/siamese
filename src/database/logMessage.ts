/* eslint-disable @typescript-eslint/naming-convention */
import Discord from "discord.js";
import * as uuid from "uuid";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

import Siamese from "~/Siamese";
import { MSG_RETRIEVE_MAXIMUM } from "~/const/discord";
import { params as channelParams } from "~/table/channel";

export default (bot: Siamese, msg: Discord.Message) => {
  if (!bot.database) return;

  if (!bot.msgCounts.has(msg.channel.id)) {
    bot.msgCounts.set(msg.channel.id, 1);
    return;
  } else {
    const prevCount = bot.msgCounts.get(msg.channel.id)!;

    bot.msgCounts.set(msg.channel.id, prevCount + 1);

    if ((prevCount + 1) % MSG_RETRIEVE_MAXIMUM === 0) {
      bot.database.putItem({
        Item: {
          channelID: {
            S: msg.channel.id
          },
          randID: {
            S: uuid.v4()
          },
          messageID: {
            S: msg.id
          }
        },
        TableName: channelParams.TableName
      } as DocumentClient.PutItemInput, undefined).promise()
        .catch(async e => {
          console.error(e);
          await bot.logger.error(e);
        });
    }
  }
};
