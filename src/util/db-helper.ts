import type Discord from "discord.js";

import GuildConfigModel, { GuildConfigDocument } from "~/model/GuildConfig";
import * as PERMISSION from "~/const/permission";

export const checkIconPermission = async (member: Discord.GuildMember, guild: Discord.Guild) => {
  if (member.permissions.has(PERMISSION.ADMINISTRATOR.flag)) return true;

  const guildConfig = await GuildConfigModel.findOne({ guildID: guild.id }).lean() as GuildConfigDocument;

  if (!guildConfig || !guildConfig.iconManageRoleID) return true;

  const role = await guild.roles.fetch(guildConfig.iconManageRoleID);

  if (!role) return false;

  return role.members.has(member.id);
};
