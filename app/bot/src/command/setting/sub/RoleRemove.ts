import { AdminOnly, CommandContext, Cooldown, GuildTextOnly, SubCommand } from "@siamese/core";
import { GuildConfig } from "@siamese/db";

import { ROLE_RESTRICT } from "../const";

class RoleRemove extends SubCommand {
  public override define() {
    return {
      data: ROLE_RESTRICT.REMOVE,
      preconditions: [
        AdminOnly,
        GuildTextOnly,
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ sender, bot, getParams, getGuildID }: CommandContext) {
    const [role] = getParams<typeof ROLE_RESTRICT.ADD.USAGE>();

    if (!role) {
      await sender.replyError(ROLE_RESTRICT.ERROR.MENTION_ROLE);
      return;
    }

    const guildID = getGuildID();
    if (!guildID) {
      await sender.replyError(ROLE_RESTRICT.ERROR.GUILD_NOT_FOUND);
      return;
    }

    const guildConfig = await GuildConfig.findByGuildID(guildID);
    if (guildConfig) {
      const activeRoles = guildConfig.activeRoles ?? [];

      const removingIndex = activeRoles.findIndex(activeRole => activeRole === role.id);
      if (removingIndex >= 0) {
        activeRoles.splice(removingIndex, 1);
        await GuildConfig.update(guildID, { activeRoles });
        await sender.send(ROLE_RESTRICT.REMOVE.REMOVED(bot, role));
      } else {
        await sender.send(ROLE_RESTRICT.REMOVE.NOT_ACTIVE_ROLE(bot, role));
      }
    } else {
      await sender.send(ROLE_RESTRICT.ERROR.NO_ROLES_TO_REMOVE);
    }
  }
}

export default RoleRemove;
