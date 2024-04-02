
import { ERROR } from "../const/message";
import { PERMISSION } from "../const/permission";

import createPrecondition from "./createPrecondition";

import type { GuildTextBasedChannel, User } from "discord.js";

const hasAdminPermissionInChannel = (user: User, channel: GuildTextBasedChannel) => {
  return !!channel
    .permissionsFor(user)
    ?.has(PERMISSION.ADMINISTRATOR.flag);
};

const AdminOnly = createPrecondition({
  text: msg => {
    if (!msg.inGuild()) return false;

    return hasAdminPermissionInChannel(msg.author, msg.channel);
  },
  slash: interaction => {
    if (!interaction.inGuild()) return false;
    if (!interaction.channel) return false;

    return hasAdminPermissionInChannel(interaction.user, interaction.channel);
  },
  onFail: async ctx => {
    await ctx.sender.replyError(ERROR.USER_SHOULD_BE_ADMIN);
  }
});

export default AdminOnly;
