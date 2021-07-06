import { Guild, GuildMember } from "discord.js";

import GuildConfig, { GuildConfigDocument } from "~/model/GuildConfig";

export default async ({ guild, author, hasAdminPermission }: {
  guild: Guild;
  author: GuildMember;
  hasAdminPermission: boolean;
}) => {
  // Config check
  const config = await GuildConfig.findOne({ guildID: guild.id }) as GuildConfigDocument;
  const activeRoles = config?.activeRoles ?? [];

  return activeRoles.length <= 0 || hasAdminPermission || author.roles.cache.some(role => activeRoles.includes(role.id));
};
