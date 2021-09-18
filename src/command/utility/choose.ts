import Command from "~/core/Command";
import { CHOOSE } from "~/const/command/utility";

export default new Command({
  name: CHOOSE.CMD,
  description: CHOOSE.DESC,
  usage: CHOOSE.USAGE,
  sendTyping: false,
  execute: async ({ bot, msg, args }) => {
    // It needs least 2 arguments to choose
    if (args.length < 2) {
      await bot.replyError(msg, CHOOSE.ARG_NOT_SUFFICIENT(bot.prefix));
      return;
    }

    await msg.reply({ content: args[Math.random() * args.length | 0] });
  }
});
