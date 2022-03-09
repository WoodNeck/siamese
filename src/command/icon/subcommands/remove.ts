/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { SlashCommandSubcommandBuilder  } from "@discordjs/builders";

import Command from "~/core/Command";
import { REMOVE } from "~/const/command/icon";
import Icon, { IconDocument } from "~/model/Icon";
import IconGroup, { IconGroupDocument } from "~/model/IconGroup";
import { checkIconPermission } from "~/util/db-helper";
import { parseArgs } from "~/util/helper";
import * as ERROR from "~/const/error";

export default new Command({
  name: REMOVE.CMD,
  description: REMOVE.DESC,
  usage: REMOVE.USAGE,
  alias: REMOVE.ALIAS,
  slashData: new SlashCommandSubcommandBuilder()
    .setName(REMOVE.CMD)
    .setDescription(REMOVE.DESC)
    .addStringOption(option => option
      .setName(REMOVE.SLASH_USAGE_ICON)
      .setDescription(REMOVE.USAGE_DESC_ICON)
      .setRequired(true)
    ).addStringOption(option => option
      .setName(REMOVE.SLASH_USAGE_GROUP)
      .setDescription(REMOVE.USAGE_DESC_GROUP)
      .setRequired(false)
    ) as SlashCommandSubcommandBuilder,
  execute: async ctx => {
    const { bot, guild, author } = ctx;

    // Check permission
    const hasPermission = await checkIconPermission(author, guild);
    if (!hasPermission) {
      return await bot.replyError(ctx, ERROR.ICON.MISSING_PERMISSION);
    }

    let groupName: string | null;
    let iconName: string;

    if (!ctx.isSlashCommand()) {
      const args = parseArgs(ctx.content);
      // Multiline is not allowed
      const name = ctx.content.split("\n")[0];

      if (!name) {
        return await bot.replyError(ctx, REMOVE.ERROR.PROVIDE_NAME_TO_REMOVE);
      }

      if (args.length <= 0 || args.length > 2) {
        return await bot.replyError(ctx, REMOVE.ERROR.PROVIDE_NAME_TO_REMOVE);
      }

      groupName = args.length === 2 ? args[0] : null;
      iconName = args.length === 2 ? args[1] : args[0];
    } else {
      groupName = ctx.interaction.options.getString(REMOVE.SLASH_USAGE_GROUP);
      iconName = ctx.interaction.options.getString(REMOVE.SLASH_USAGE_ICON, true);
    }

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

    await bot.send(ctx, { content: REMOVE.SUCCESS(iconName) });
  }
});
