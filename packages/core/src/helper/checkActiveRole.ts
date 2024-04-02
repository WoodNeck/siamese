import { GuildConfig } from "@siamese/db";

import { PERMISSION } from "../const/permission";

import type { GuildTextBasedChannel, User } from "discord.js";

/**
 * 명령어를 사용한 유저가 명령어를 사용할 수 있는 역할이 있는지 체크
 */
const checkActiveRole = async (user: User, channel: GuildTextBasedChannel | null) => {
  if (!channel) return true;

  const guild = channel.guild;
  const permission = channel.permissionsFor(user);
  const hasAdminPermission = permission?.has(PERMISSION.ADMINISTRATOR.flag);
  const activeRoles = await GuildConfig.getActiveRoles(guild.id);
  const member = await guild.members.fetch(user);

  return activeRoles.length <= 0
    || hasAdminPermission
    || member?.roles.cache.some(role => activeRoles.includes(role.id));
};

export default checkActiveRole;
