/* eslint-disable @typescript-eslint/naming-convention */
import Discord from "discord.js";

import Siamese from "~/Siamese";
import MessageLog from "~/model/MessageLog";
import { MSG_RETRIEVE_MAXIMUM } from "~/const/discord";

export default async (bot: Siamese, msg: Discord.Message) => {
  if (!bot.database) return;

  if (!bot.msgCounts.has(msg.channel.id)) {
    bot.msgCounts.set(msg.channel.id, 1);
    return;
  } else {
    const prevCount = bot.msgCounts.get(msg.channel.id)!;

    bot.msgCounts.set(msg.channel.id, prevCount + 1);

    if ((prevCount + 1) % MSG_RETRIEVE_MAXIMUM === 0) {
      await MessageLog.create({
        channelID: msg.channel.id,
        messageID: msg.id
      }).catch(async e => {
        await bot.logger.error(e);
      });
    }
  }
};
