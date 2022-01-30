import Siamese from "~/Siamese";
import * as PERMISSION from "~/const/permission";
import { checkIconPermission } from "~/util/helper";

export const hasPermission = async (bot: Siamese, userID: string, guildID: string) => {
  const guild = bot.guilds.cache.get(guildID);

  if (!guild) return false;

  const member = await guild.members.fetch(userID);

  if (!member) return false;

  return await checkIconPermission(member, guild);
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
