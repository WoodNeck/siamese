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

    let totalSeconds = (bot.uptime || 0) / 1000;
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const times: string[] = [];

    if (days > 0) {
      times.push(PING.FORMAT.DAYS(days));
    }
    if (hours > 0) {
      times.push(PING.FORMAT.HOURS(hours));
    }
    if (minutes > 0) {
      times.push(PING.FORMAT.MINUTES(minutes));
    }
    if (seconds > 0) {
      times.push(PING.FORMAT.SECONDS(seconds));
    }

    await bot.send(ctx, {
      content: PING.MSG(bot.ws.ping.toFixed(1), bot.user.toString(), bot.getDisplayName(guild), times.join(" "))
    });
  }
});

