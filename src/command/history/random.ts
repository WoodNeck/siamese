import { MessageEmbed } from "discord.js";

import Command from "~/core/Command";
import * as COLOR from "~/const/color";
import * as PERMISSION from "~/const/permission";
import { RANDOM } from "~/const/command/history";
import { MSG_RETRIEVE_MAXIMUM, MESSAGE_MAX_LENGTH } from "~/const/discord";
import getRandomMessage from "~/database/getRandomMessage";
import dedent from "~/util/helper";

export default new Command({
  name: RANDOM.CMD,
  description: RANDOM.DESC,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.READ_MESSAGE_HISTORY
  ],
  execute: async ({ bot, guild, channel, msg }) => {
    // Retrieve one msg from message history of channel
    const loggedMessage = await getRandomMessage(channel);
    const msgId = loggedMessage ? loggedMessage.messageID : msg.id;

    const randomMsgs = await channel.messages.fetch({
      limit: MSG_RETRIEVE_MAXIMUM,
      around: msgId
    }, false);

    const randomMsg = randomMsgs
      .filter(message => !message.author.bot)
      .random();

    if (!randomMsg) {
      return await bot.replyError(msg, RANDOM.ERROR.CANT_FIND_MSG);
    }

    const embed = new MessageEmbed()
      .setAuthor(
        randomMsg.author.username,
        randomMsg.author.avatarURL() || "",
      )
      .setDescription(dedent`
        ${randomMsg.content.substr(0, MESSAGE_MAX_LENGTH)}
        ${RANDOM.MSG_CHECK(RANDOM.MSG_URL(guild.id, channel.id, randomMsg.id))}`)
      .setColor(COLOR.BOT)
      .setTimestamp(randomMsg.createdTimestamp);
    if (randomMsg.attachments.size) {
      embed.setImage(randomMsg.attachments.random().url);
    }

    await bot.send(channel, embed);
  }
});
