import { AdminOnly, CommandContext, GuildTextOnly, SubCommand } from "@siamese/core";
import { GuildConfig } from "@siamese/db";

import { ROLE_RESTRICT } from "../const";

class RoleAdd extends SubCommand {
  public override define() {
    return {
      data: ROLE_RESTRICT.ADD,
      preconditions: [
        AdminOnly,
        GuildTextOnly
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
      const newActiveRoles = new Set([...(guildConfig.activeRoles ?? []), role.id]);
      guildConfig.activeRoles = [...newActiveRoles];

      await GuildConfig.update(guildID, guildConfig);
    } else {
      await GuildConfig.create({
        guildID: guildID,
        activeRoles: [role.id]
      });
    }

    await sender.send(ROLE_RESTRICT.ADD.ADDED(bot, role));
  }
}

export default RoleAdd;

