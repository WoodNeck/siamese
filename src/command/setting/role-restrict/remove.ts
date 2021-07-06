import Command from "~/core/Command";
import { ROLE_RESTRICT } from "~/const/command/setting";
import GuildConfig, { GuildConfigDocument } from "~/model/GuildConfig";

export default new Command({
  name: ROLE_RESTRICT.REMOVE.CMD,
  description: ROLE_RESTRICT.REMOVE.DESC,
  usage: ROLE_RESTRICT.REMOVE.USAGE,
  alias: ROLE_RESTRICT.REMOVE.ALIAS,
  adminOnly: true,
  execute: async ({ bot, guild, channel, msg }) => {
    const rolesMentioned = msg.mentions.roles;

    if (rolesMentioned.size <= 0) {
      return await bot.replyError(msg, ROLE_RESTRICT.ERROR.MENTION_ROLE);
    }

    const guildConfig = await GuildConfig.findOne({ guildID: guild.id }) as GuildConfigDocument;
    const removingRoles = [...rolesMentioned.values()].map(role => role.id);

    if (guildConfig) {
      const activeRoles = guildConfig.activeRoles ?? [];

      removingRoles.forEach(removingRole => {
        const removingIndex = activeRoles.findIndex(activeRole => activeRole === removingRole);
        if (removingIndex >= 0) {
          activeRoles.splice(removingIndex, 1);
        }
      });

      await guildConfig.save();

      await bot.send(channel, ROLE_RESTRICT.REMOVE.REMOVED(bot, guild, removingRoles));
    } else {
      await bot.send(channel, ROLE_RESTRICT.ERROR.NO_ROLES_TO_REMOVE);
    }
  }
});
