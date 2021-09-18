import Discord from "discord.js";

import Siamese from "~/Siamese";
import GuildConfigModel, { GuildConfigDocument } from "~/model/GuildConfig";
import * as PERMISSION from "~/const/permission";

export const checkPermission = async (member: Discord.GuildMember, guild: Discord.Guild) => {
  if (member.permissions.has(PERMISSION.ADMINISTRATOR.flag)) return true;

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

export const isAdmin = async (bot: Siamese, userID: string, guildID: string) => {
  const guild = bot.guilds.cache.get(guildID);

  if (!guild) return false;

  const member = await guild.members.fetch(userID);

  if (!member) return false;

  return member.permissions.has(PERMISSION.ADMINISTRATOR.flag);
};

export const getUserAvatar = (userID: string, discriminator: string, avatarHash?: string) => {
  const base = "https://cdn.discordapp.com";

  return avatarHash
    ? `${base}/avatars/${userID}/${avatarHash}.webp`
    : `${base}/embed/avatars/${parseInt(discriminator, 10) % 5}.png`;
};

export const getGuildIcon = (guildID: string, guildIcon: string) => guildIcon
  ? `https://cdn.discordapp.com/icons/${guildID}/${guildIcon}.webp`
  : null;
