import { Command } from "@siamese/core";
import { Duration } from "@siamese/time";

import { PING } from "./const";

import type { CommandContext } from "@siamese/core";

class Ping extends Command {
  public override define() {
    return {
      data: PING
    };
  }

  public override async execute({ bot, sender, getBotName }: CommandContext) {
    const client = bot.client;
    const ping = client.ws.ping.toFixed(1);
    const uptime = Duration.format(client.uptime || 0);
    const botMention = client.user.toString();
    const botName = getBotName();

    await sender.send(PING.MSG(ping, botMention, botName, uptime));
  }
}

export default Ping;
