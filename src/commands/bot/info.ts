import { MessageEmbed } from "discord.js";
import * as COLOR from "~/const/color";
import * as PERMISSION from "~/const/permission";
import { INFO } from "~/const/commands/bot";
import Command from "~/core/Command";
import CommandContext from "~/types/CommandContext";


export default new Command({
  name: INFO.CMD,
  description: INFO.DESC,
  permissions: [PERMISSION.EMBED_LINKS],
  execute: async ({ bot, channel, guild }: CommandContext) => {
    const guildCnt = bot.guilds.cache.size;
    const userCnt = bot.users.cache.filter(user => !user.bot).size;
    const botName = bot.getDisplayName(guild);

    const embed = new MessageEmbed()
      .setAuthor(botName, bot.user.avatarURL() || "")
      .setColor(COLOR.BOT)
      .setThumbnail(bot.user.avatarURL() || "");

    const descs = [
      INFO.GUILD_CNT(guildCnt),
      INFO.USER_CNT(userCnt)
    ];

    if (bot.env.BOT_DEV_SERVER_ID && bot.env.BOT_DEV_SERVER_INVITE) {
      const devServer = await bot.guilds.fetch(bot.env.BOT_DEV_SERVER_ID).catch(() => null);

      if (devServer) {
        descs.push(INFO.DEV_SERVER(devServer, bot.env.BOT_DEV_SERVER_INVITE));
      }
    }

    embed.setDescription(descs.join("\n"));

    if (bot.env.BOT_GITHUB_URL) {
      embed.setFooter(bot.env.BOT_GITHUB_URL, INFO.GITHUB_ICON_URL);
    }

    await bot.send(channel, embed);
  }
});
