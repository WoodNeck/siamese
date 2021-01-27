import Command from "~/core/Command";
import { PING } from "~/const/command/bot";
import CommandContext from "~/type/CommandContext";


export default new Command({
  name: PING.CMD,
  description: PING.DESC,
  execute: async ({ bot, guild, channel }: CommandContext) => {
    const uptime = new Date(bot.uptime || 0);

    await bot.send(channel, PING.MSG(bot.ws.ping.toFixed(1), bot, guild, uptime));
  }
});

