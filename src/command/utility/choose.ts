import Command from "~/core/Command";
import { CHOOSE } from "~/const/command/utility";

export default new Command({
  name: CHOOSE.CMD,
  description: CHOOSE.DESC,
  usage: CHOOSE.USAGE,
  sendTyping: false,
  execute: async ctx => {
    if (ctx.isSlashCommand()) return;

    const { bot, args } = ctx;

    // It needs least 2 arguments to choose
    if (args.length < 2) {
      await bot.replyError(ctx, CHOOSE.ARG_NOT_SUFFICIENT(bot.prefix));
      return;
    }

    await bot.send(ctx, { content: args[Math.random() * args.length | 0] });
  }
});
