import { Collection, Message, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "~/core/Command";
import * as COLOR from "~/const/color";
import * as PERMISSION from "~/const/permission";
import { RANDOM } from "~/const/command/history";
import { MSG_RETRIEVE_MAXIMUM, MESSAGE_MAX_LENGTH } from "~/const/discord";
import getRandomMessage from "~/database/getRandomMessage";
import { dedent } from "~/util/helper";

export default new Command({
  name: RANDOM.CMD,
  description: RANDOM.DESC,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.READ_MESSAGE_HISTORY
  ],
  slashData: new SlashCommandBuilder()
    .setName(RANDOM.CMD)
    .setDescription(RANDOM.DESC),
  execute: async ctx => {
    const { bot, guild, channel } = ctx;
    const userMsgID = ctx.isSlashCommand()
      ? ctx.interaction.channel?.lastMessageId as string
      : ctx.msg.id;

    // Retrieve one msg from message history of channel
    const loggedMessage = await getRandomMessage(channel);
    const msgId = loggedMessage
      ? loggedMessage.messageID
      : userMsgID;

    const data = await ((bot as any).api).channels[channel.id].messages.get({ query: {
      around: msgId,
      limit: MSG_RETRIEVE_MAXIMUM
    }});
    const randomMsgs = new Collection<string, Message>();
    for (const message of data) {
      randomMsgs.set(message.id, message);
    }

    const randomMsgID = randomMsgs
      .filter(message => !message.author.bot)
      .random().id;
    const randomMsg = randomMsgID
      ? await channel.messages.fetch(randomMsgID)
      : null;

    if (!randomMsg) {
      return await bot.replyError(ctx, RANDOM.ERROR.CANT_FIND_MSG);
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

    await bot.send(ctx, { embeds: [embed] });
  }
});
