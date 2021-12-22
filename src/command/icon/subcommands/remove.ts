/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import Command from "~/core/Command";
import { REMOVE } from "~/const/command/icon";
import Icon, { IconDocument } from "~/model/Icon";
import IconGroup, { IconGroupDocument } from "~/model/IconGroup";

export default new Command({
  name: REMOVE.CMD,
  description: REMOVE.DESC,
  usage: REMOVE.USAGE,
  alias: REMOVE.ALIAS,
  execute: async ctx => {
    if (ctx.isSlashCommand()) return;

    const { bot, guild, content, args } = ctx;

    // No multiline is allowed
    const name = content.split("\n")[0];

    if (!name) {
      return await bot.replyError(ctx, REMOVE.ERROR.PROVIDE_NAME_TO_REMOVE);
    }

    if (args.length <= 0 || args.length > 2) {
      return await bot.replyError(ctx, REMOVE.ERROR.PROVIDE_NAME_TO_REMOVE);
    }

    const groupName = args.length === 2 ? args[0] : null;
    const iconName = args.length === 2 ? args[1] : args[0];

    let group: IconGroupDocument | null = null;

    if (groupName) {
      group = await IconGroup.findOne({
        guildID: guild.id,
        name: groupName
      }).exec() as IconGroupDocument;

      if (!group) {
        return await bot.replyError(ctx, REMOVE.ERROR.NOT_FOUND);
      }
    }

    const prevInfo = await Icon.findOne({
      name: iconName,
      guildID: guild.id,
      groupID: group ? group.id as string : "0"
    }).exec() as IconDocument;

    if (!prevInfo) {
      return await bot.replyError(ctx, REMOVE.ERROR.NOT_FOUND);
    }

    await prevInfo.remove();

    if (group) {
      const count = await Icon.countDocuments({
        guildID: guild.id,
        groupID: group.id as string
      }).exec() as number;

      if (count <= 0) {
        await group.remove();
      }
    }

    await bot.send(ctx, { content: REMOVE.SUCCESS(name) });
  }
});
