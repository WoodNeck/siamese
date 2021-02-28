import Discord from "discord.js";

import Siamese from "~/Siamese";

export const checkPermission = (bot: Siamese, member: Discord.GuildMember, guild: Discord.Guild) => {
  // guild.roles.some(
  //   role => role.name === global.env.FILE_MANAGEMENT_ROLE_NAME
  //     && user.roles.has(role.id)
  // );
};

export const hasPermission = async (bot: Siamese, userId: string, guildId: string) => {
  const guild = await bot.guilds.fetch(guildId);
  const user = guild && await guild.members.fetch(userId);

  return guild && user && checkPermission(bot, user, guild);
};

