import Command from "~/core/Command";
import { ROLE } from "~/const/command/icon";
import GuildConfig from "~/model/GuildConfig";

export default new Command({
  name: ROLE.CMD,
  description: ROLE.DESC,
  usage: ROLE.USAGE,
  alias: ROLE.ALIAS,
  adminOnly: true,
  execute: async ({ bot, msg, channel, guild }) => {
    const rolesMentioned = msg.mentions.roles;

    if (rolesMentioned.size > 1) {
      return await bot.replyError(msg, ROLE.ERROR.PROVIDE_EXACTLY_ONE_ROLE);
    }

    const role = rolesMentioned.size > 0
      ? rolesMentioned.first()!
      : null;
    await GuildConfig.findOneAndUpdate(
      { guildID: guild.id },
      { iconManageRoleID: role ? role.id : undefined },
      { upsert: true }
    ).lean();

    await bot.send(channel, role ? ROLE.MSG.SUCCESS_WITH_ROLE(role) : ROLE.MSG.SUCCESS_WITHOUT_ROLE);
  }
});
