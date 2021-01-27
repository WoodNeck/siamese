import { MessageEmbed } from "discord.js";

import Command from "~/core/Command";
import { INVITE } from "~/const/command/bot";
import * as COLOR from "~/const/color";
import * as PERMISSION from "~/const/permission";
import CommandContext from "~/type/CommandContext";

export default new Command({
  name: INVITE.CMD,
  description: INVITE.DESC,
  permissions: [PERMISSION.EMBED_LINKS],
  execute: async ({ bot, channel, guild }: CommandContext) => {
    const botName = bot.getDisplayName(guild);

    const link = await bot.generateInvite({
      permissions: bot.permissions
    });

    const embed = new MessageEmbed()
      .setAuthor(INVITE.TITLE(botName), bot.user.avatarURL() || "")
      .setDescription(`[${INVITE.MSG(botName)}](${link})`)
      .setColor(COLOR.BOT);
    await bot.send(channel, embed);
  }
});

