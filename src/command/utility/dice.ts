import Command from "~/core/Command";
import { DICE } from "~/const/command/utility";

export default new Command({
  name: DICE.CMD,
  description: DICE.DESC,
  usage: DICE.USAGE,
  sendTyping: false,
  execute: async ctx => {
    if (ctx.isSlashCommand()) return;

    const { bot, author, args } = ctx;

    const isNum = /^\d+$/;
    // Non-number case
    if (args.length && !isNum.test(args[0])) {
      await bot.replyError(ctx, DICE.ARG_INCORRECT(DICE.MIN, DICE.MAX));
      return;
    }

    const diceNum = args.length && isNum.test(args[0]) ?
      parseInt(args[0], 10) : DICE.DEFAULT;

    // Out-of-range case
    if (diceNum > DICE.MAX || diceNum < DICE.MIN) {
      await bot.replyError(ctx, DICE.ARG_INCORRECT(DICE.MIN, DICE.MAX));
      return;
    }

    const diceResult = Math.floor(Math.random() * (diceNum)) + 1;

    await bot.send(ctx, { content: DICE.MSG(author.toString(), diceResult, diceNum) });
  }
});
