import Command from "~/core/Command";
import CommandContext from "~/core/CommandContext";
import { PING } from "~/const/command/bot";


export default new Command({
  name: PING.CMD,
  description: PING.DESC,
  sendTyping: false,
  execute: async ({ bot, guild, channel }: CommandContext) => {
    const uptime = new Date(bot.uptime || 0);

    await bot.send(channel, PING.MSG(bot.ws.ping.toFixed(1), bot.user.toString(), bot.getDisplayName(guild), uptime));
  }
});

