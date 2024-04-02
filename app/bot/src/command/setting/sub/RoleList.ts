import { AdminOnly, CommandContext, Cooldown, GuildTextOnly, SubCommand } from "@siamese/core";
import { GuildConfig } from "@siamese/db";
import { Role } from "discord.js";

import { ROLE_RESTRICT } from "../const";

class RoleList extends SubCommand {
  public override define() {
    return {
      data: ROLE_RESTRICT.LIST,
      preconditions: [
        AdminOnly,
        GuildTextOnly,
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ sender, bot, getGuildID }: CommandContext) {
    const guildID = getGuildID();
    if (!guildID) {
      await sender.replyError(ROLE_RESTRICT.ERROR.GUILD_NOT_FOUND);
      return;
    }

    const config = await GuildConfig.findByGuildID(guildID);
    if (!config || !config.activeRoles || config.activeRoles.length <= 0) {
      await sender.send(ROLE_RESTRICT.LIST.CAN_BE_USED_FOR_EVERYONE(bot));
      return;
    }

    const guild = await bot.client.guilds.fetch(guildID);
    const roles = config.activeRoles;
    const fetchedRoles = await Promise.all(roles.map(role => guild.roles.fetch(role)));

    const removedRoles = fetchedRoles.reduce((removed, role, idx) => {
      if (role == null) removed.push(roles[idx]);
      return removed;
    }, [] as string[]);

    if (removedRoles.length > 0) {
      const activeRoles = config.activeRoles;
      removedRoles.forEach(removedRole => {
        const removingIndex = activeRoles.findIndex(activeRole => activeRole === removedRole);
        if (removingIndex >= 0) {
          activeRoles.splice(removingIndex, 1);
        }
      });

      await GuildConfig.update(guildID, { activeRoles });
    }

    const nonRemovedRoles = fetchedRoles.filter(role => !!role) as Role[];

    if (nonRemovedRoles.length <= 0) {
      await sender.send(ROLE_RESTRICT.LIST.CAN_BE_USED_FOR_EVERYONE(bot));
      return;
    }

    await sender.send(ROLE_RESTRICT.LIST.ACTIVE_ROLES(nonRemovedRoles));
  }
}

export default RoleList;
