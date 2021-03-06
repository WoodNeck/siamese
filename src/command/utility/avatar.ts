import { MessageEmbed } from "discord.js";

import Command from "~/core/Command";
import * as COLOR from "~/const/color";
import * as PERMISSION from "~/const/permission";
import { AVATAR } from "~/const/command/utility";

export default new Command({
  name: AVATAR.CMD,
  description: AVATAR.DESC,
  usage: AVATAR.USAGE,
  permissions: [PERMISSION.EMBED_LINKS],
  sendTyping: false,
  execute: async ({ bot, msg, channel }) => {
    if (!msg.mentions.users.size) {
      await bot.replyError(msg, AVATAR.MENTION_NEEDED(bot.prefix, bot.user.username));
      return;
    }
    if (msg.mentions.users.size > 1) {
      await bot.replyError(msg, AVATAR.MENTION_ONLY_ONE);
      return;
    }

    const mentioned = msg.mentions.users.first()!;

    const embed = new MessageEmbed()
      .setImage(mentioned.avatarURL() || "")
      .setFooter(mentioned.username, mentioned.avatarURL() || "")
      .setColor(COLOR.BOT);

    await bot.send(channel, embed);
  }
});
