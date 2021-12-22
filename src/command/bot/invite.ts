import { MessageEmbed } from "discord.js";

import Command from "~/core/Command";
import { INVITE } from "~/const/command/bot";
import * as COLOR from "~/const/color";
import * as PERMISSION from "~/const/permission";

export default new Command({
  name: INVITE.CMD,
  description: INVITE.DESC,
  permissions: [PERMISSION.EMBED_LINKS],
  sendTyping: false,
  execute: async ctx => {
    const { bot, guild } = ctx;
    const botName = bot.getDisplayName(guild);

    const link = bot.generateInvite({
      scopes: ["bot", "applications.commands"],
      permissions: bot.permissions
    });

    const embed = new MessageEmbed()
      .setAuthor(INVITE.TITLE(botName), bot.user.avatarURL() || "")
      .setDescription(`[${INVITE.MSG(botName)}](${link})`)
      .setColor(COLOR.BOT);
    await bot.send(ctx, { embeds: [embed] });
  }
});

