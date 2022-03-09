import { MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "~/core/Command";
import { CHOOSE } from "~/const/command/utility";
import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import * as PERMISSION from "~/const/permission";
import { parseArgs } from "~/util/helper";
import { strong } from "~/util/markdown";

export default new Command({
  name: CHOOSE.CMD,
  description: CHOOSE.DESC,
  usage: CHOOSE.USAGE,
  permissions: [PERMISSION.EMBED_LINKS],
  sendTyping: false,
  slashData: new SlashCommandBuilder()
    .setName(CHOOSE.CMD)
    .setDescription(CHOOSE.DESC)
    .addStringOption(option => option
      .setName(CHOOSE.USAGE_OPTION)
      .setDescription(CHOOSE.DESC_OPTION)
      .setRequired(true)
    ) as SlashCommandBuilder,
  execute: async ctx => {
    const { bot } = ctx;
    const content = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(CHOOSE.USAGE_OPTION, true)
      : ctx.content;
    const args = parseArgs(content);

    // It needs least 2 arguments to choose
    if (args.length < 2) {
      return await bot.replyError(ctx, CHOOSE.ARG_NOT_SUFFICIENT(bot.prefix));
    }

    const choosed = args[Math.random() * args.length | 0];

    const embed = new MessageEmbed({
      footer: {
        text: `${EMOJI.SPEECH_BUBBLE} ${args.join(" ")}`
      }
    }).setDescription(strong(choosed)).setColor(COLOR.BOT);

    await bot.send(ctx, { embeds: [embed] });
  }
});
