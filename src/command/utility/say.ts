import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "~/core/Command";
import { SAY } from "~/const/command/utility";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";

export default new Command({
  name: SAY.CMD,
  description: SAY.DESC,
  usage: SAY.USAGE,
  permissions: [
    PERMISSION.MANAGE_MESSAGES
  ],
  sendTyping: false,
  slashData: new SlashCommandBuilder()
    .setName(SAY.CMD)
    .setDescription(SAY.DESC)
    .addStringOption(option => option
      .setName(SAY.USAGE_OPTION)
      .setDescription(SAY.DESC_OPTION)
      .setRequired(true)
    ) as SlashCommandBuilder,
  execute: async ctx => {
    const { bot } = ctx;

    const content = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(SAY.USAGE_OPTION, true)
      : ctx.content;

    // Can't react for empty content
    if (!content) {
      await bot.replyError(ctx, ERROR.CMD.EMPTY_CONTENT(SAY.TARGET));
      return;
    }

    if (!ctx.isSlashCommand()) {
      await ctx.msg.delete();
    } else {
      await ctx.interaction.reply({ content: SAY.SLASH_PLACEHOLDER, ephemeral: true });
    }

    await ctx.channel.send({ content });
  }
});
