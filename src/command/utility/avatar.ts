import { MessageEmbed } from "discord.js";

import Command from "~/core/Command";
import * as COLOR from "~/const/color";
import * as PERMISSION from "~/const/permission";
import * as ERROR from "~/const/error";
import { AVATAR } from "~/const/command/utility";

export default new Command({
  name: AVATAR.CMD,
  description: AVATAR.DESC,
  usage: AVATAR.USAGE,
  permissions: [PERMISSION.EMBED_LINKS],
  sendTyping: false,
  execute: async ({ bot, msg }) => {
    if (!msg.mentions.users.size) {
      await bot.replyError(msg, ERROR.CMD.MENTION_NEEDED);
      return;
    }
    if (msg.mentions.users.size > 1) {
      await bot.replyError(msg, ERROR.CMD.MENTION_ONLY_ONE);
      return;
    }

    const mentioned = msg.mentions.users.first()!;

    const embed = new MessageEmbed()
      .setImage(mentioned.avatarURL() || "")
      .setFooter(mentioned.username, mentioned.avatarURL() || "")
      .setColor(COLOR.BOT);

    await msg.reply({ embeds: [embed] });
  }
});
