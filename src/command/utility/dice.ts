import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "~/core/Command";
import { DICE } from "~/const/command/utility";
import { parseArgs } from "~/util/helper";

export default new Command({
  name: DICE.CMD,
  description: DICE.DESC,
  usage: DICE.USAGE,
  sendTyping: false,
  slashData: new SlashCommandBuilder()
    .setName(DICE.CMD)
    .setDescription(DICE.DESC)
    .addIntegerOption(option => option
      .setName(DICE.USAGE_OPTION)
      .setDescription(DICE.DESC_OPTION)
      .setRequired(false)
    ) as SlashCommandBuilder,
  execute: async ctx => {
    const { bot, author } = ctx;

    const diceNumOption = ctx.isSlashCommand()
      ? ctx.interaction.options.getInteger(DICE.USAGE_OPTION, false)
      : parseArgs(ctx.content)[0];

    const isNum = /^\d+$/;
    // Non-number case
    if (diceNumOption && !isNum.test(diceNumOption.toString())) {
      await bot.replyError(ctx, DICE.ARG_INCORRECT(DICE.MIN, DICE.MAX));
      return;
    }

    const diceNum = diceNumOption && isNum.test(diceNumOption.toString()) ?
      parseInt(diceNumOption.toString(), 10) : DICE.DEFAULT;

    // Out-of-range case
    if (diceNum > DICE.MAX || diceNum < DICE.MIN) {
      await bot.replyError(ctx, DICE.ARG_INCORRECT(DICE.MIN, DICE.MAX));
      return;
    }

    const diceResult = Math.floor(Math.random() * (diceNum)) + 1;

    await bot.send(ctx, { content: DICE.MSG(author.toString(), diceResult, diceNum) });
  }
});
