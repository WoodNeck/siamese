import Command from "~/core/Command";
import { ROLE_RESTRICT } from "~/const/command/setting";
import GuildConfig, { GuildConfigDocument } from "~/model/GuildConfig";

export default new Command({
  name: ROLE_RESTRICT.ADD.CMD,
  description: ROLE_RESTRICT.ADD.DESC,
  usage: ROLE_RESTRICT.ADD.USAGE,
  alias: ROLE_RESTRICT.ADD.ALIAS,
  adminOnly: true,
  execute: async ({ bot, guild, channel, msg }) => {
    const rolesMentioned = msg.mentions.roles;

    if (rolesMentioned.size <= 0) {
      return await bot.replyError(msg, ROLE_RESTRICT.ERROR.MENTION_ROLE);
    }

    const guildConfig = await GuildConfig.findOne({ guildID: guild.id }) as GuildConfigDocument;
    const rolesAdded = [...rolesMentioned.values()].map(role => role.id);

    if (guildConfig) {
      const newActiveRoles = new Set([...(guildConfig.activeRoles ?? []), ...rolesAdded]);

      guildConfig.activeRoles = [...newActiveRoles];

      await guildConfig.save();
    } else {
      await GuildConfig.create({
        guildID: guild.id,
        activeRoles: rolesAdded
      });
    }

    await bot.send(channel, ROLE_RESTRICT.ADD.ADDED(bot, guild, [...rolesMentioned.values()]));
  }
});
