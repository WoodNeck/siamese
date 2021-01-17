import Command from "../../core/Command";
import { PING } from "~/const/commands/bot";
import CommandContext from "~/types/CommandContext";


export default new Command({
  name: PING.CMD,
  description: PING.DESC,
  execute: async ({ bot, guild, channel }: CommandContext) => {
    const uptime = new Date(bot.uptime || 0);

    await bot.send(channel, PING.MSG(bot.ws.ping.toFixed(1), bot, guild, uptime));
  }
});

