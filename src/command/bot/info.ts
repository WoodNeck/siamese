import { MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "~/core/Command";
import * as COLOR from "~/const/color";
import * as PERMISSION from "~/const/permission";
import { INFO } from "~/const/command/bot";


export default new Command({
  name: INFO.CMD,
  description: INFO.DESC,
  permissions: [PERMISSION.EMBED_LINKS],
  sendTyping: false,
  slashData: new SlashCommandBuilder()
    .setName(INFO.CMD)
    .setDescription(INFO.DESC),
  execute: async ctx => {
    const { bot, guild } = ctx;
    const guildCnt = bot.guilds.cache.size;
    const botName = bot.getDisplayName(guild);

    const embed = new MessageEmbed()
      .setAuthor({
        name: botName,
        iconURL: bot.user.displayAvatarURL()
      })
      .setColor(COLOR.BOT)
      .setThumbnail(bot.user.displayAvatarURL());

    const descs = [ INFO.GUILD_CNT(guildCnt) ];

    if (bot.env.BOT_DEV_SERVER_ID && bot.env.BOT_DEV_SERVER_INVITE) {
      const devServer = await bot.guilds.fetch(bot.env.BOT_DEV_SERVER_ID).catch(() => null);

      if (devServer) {
        descs.push(INFO.DEV_SERVER(devServer.name, bot.env.BOT_DEV_SERVER_INVITE));
      }
    }

    embed.setDescription(descs.join("\n"));

    if (bot.env.BOT_GITHUB_URL) {
      embed.setFooter({ text: bot.env.BOT_GITHUB_URL, iconURL: INFO.GITHUB_ICON_URL });
    }

    await bot.send(ctx, { embeds: [embed] });
  }
});
