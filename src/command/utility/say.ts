import Command from "~/core/Command";
import { SAY } from "~/const/command/utility";
import * as ERROR from "~/const/error";

export default new Command({
  name: SAY.CMD,
  description: SAY.DESC,
  usage: SAY.USAGE,
  execute: async ({ bot, msg, channel, content }) => {
    // Can't react for empty content
    if (!content) {
      await bot.replyError(msg, ERROR.CMD.EMPTY_CONTENT(SAY.TARGET));
      return;
    }

    await msg.delete();
    await bot.send(channel, content);
  }
});
