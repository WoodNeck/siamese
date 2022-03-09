import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "~/core/Command";
import { PING } from "~/const/command/bot";


export default new Command({
  name: PING.CMD,
  description: PING.DESC,
  sendTyping: false,
  slashData: new SlashCommandBuilder()
    .setName(PING.CMD)
    .setDescription(PING.DESC),
  execute: async ctx => {
    const { bot, guild } = ctx;
    const uptime = new Date(bot.uptime || 0);

    await bot.send(ctx, {
      content: PING.MSG(bot.ws.ping.toFixed(1), bot.user.toString(), bot.getDisplayName(guild), uptime)
    });
  }
});

