import Discord from "discord.js";

import Siamese from "~/Siamese";
import GuildConfigModel, { GuildConfigDocument } from "~/model/GuildConfig";
import * as PERMISSION from "~/const/permission";

export const checkPermission = async (member: Discord.GuildMember, guild: Discord.Guild) => {
  if (member.hasPermission(PERMISSION.ADMINISTRATOR.flag)) return true;

  const guildConfig = await GuildConfigModel.findOne({ guildID: guild.id }).lean() as GuildConfigDocument;

  if (!guildConfig || !guildConfig.iconManageRoleID) return true;

  const role = await guild.roles.fetch(guildConfig.iconManageRoleID);

  if (!role) return false;

  return role.members.has(member.id);
};

export const hasPermission = async (bot: Siamese, userID: string, guildID: string) => {
  const guild = bot.guilds.cache.get(guildID);

  if (!guild) return false;

  const member = await guild.members.fetch(userID);

  if (!member) return false;

  return await checkPermission(member, guild);
};

