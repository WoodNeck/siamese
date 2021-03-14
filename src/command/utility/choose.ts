import Command from "~/core/Command";
import { CHOOSE } from "~/const/command/utility";

export default new Command({
  name: CHOOSE.CMD,
  description: CHOOSE.DESC,
  usage: CHOOSE.USAGE,
  execute: async ({ bot, msg, channel, args }) => {
    // It needs least 2 arguments to choose
    if (args.length < 2) {
      await bot.replyError(msg, CHOOSE.ARG_NOT_SUFFICIENT(bot.prefix));
      return;
    }

    await bot.send(channel, args[Math.random() * args.length | 0]);
  }
});
