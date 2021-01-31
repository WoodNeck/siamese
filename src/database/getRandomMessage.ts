/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import Discord from "discord.js";

import MessageLog, { MessageLogDocument } from "~/model/MessageLog";

export default async (channel: Discord.TextChannel): Promise<MessageLogDocument | null> => (
  new Promise((resolve, reject) => {
    MessageLog.countDocuments({
      channelID: channel.id
    }, async (err: Error, count: number) => {
      if (err) return reject(err);
      if (count <= 0) return resolve(null);

      const randCnt = Math.floor(Math.random() * count);

      // Again query all users but only fetch one offset by our random #
      const msgLog = await MessageLog.findOne({ channelID: channel.id }).lean().skip(randCnt).exec() as MessageLogDocument;

      return resolve(msgLog);
    });
  })
);
