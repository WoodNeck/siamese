import { Role } from "discord.js";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import { ROLE_RESTRICT } from "~/const/command/setting";
import GuildConfig, { GuildConfigDocument } from "~/model/GuildConfig";

export default new Command({
  name: ROLE_RESTRICT.LIST.CMD,
  description: ROLE_RESTRICT.LIST.DESC,
  cooldown: Cooldown.PER_CHANNEL(5),
  execute: async ctx => {
    const { bot, guild, channel } = ctx;

    const config = await GuildConfig.findOne({
      guildID: guild.id
    }).lean().exec() as GuildConfigDocument;

    if (!config || config.activeRoles.length <= 0) {
      await bot.send(channel, ROLE_RESTRICT.LIST.CAN_BE_USED_FOR_EVERYONE(bot));
      return;
    }

    const roles = config.activeRoles;
    const fetchedRoles = await Promise.all(roles.map(role => guild.roles.fetch(role)));

    const removedRoles = fetchedRoles.reduce((removed, role, idx) => {
      if (role == null) removed.push(roles[idx]);
      return removed;
    }, [] as string[]);

    if (removedRoles.length > 0) {
      // Remove removed roles from config
      const guildConfig = await GuildConfig.findOne({
        guildID: guild.id
      }) as GuildConfigDocument;
      const activeRoles = guildConfig.activeRoles;

      removedRoles.forEach(removedRole => {
        const removingIndex = activeRoles.findIndex(activeRole => activeRole === removedRole);
        if (removingIndex >= 0) {
          activeRoles.splice(removingIndex, 1);
        }
      });

      await guildConfig.save();
    }

    const nonRemovedRoles = fetchedRoles.filter(role => !!role) as Role[];

    if (nonRemovedRoles.length <= 0) {
      await bot.send(channel, ROLE_RESTRICT.LIST.CAN_BE_USED_FOR_EVERYONE(bot));
      return;
    }

    await bot.send(channel, ROLE_RESTRICT.LIST.ACTIVE_ROLES(nonRemovedRoles));
  }
});
