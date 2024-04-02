import { COLOR } from "@siamese/color";
import { Command, CommandContext } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { env } from "@siamese/env";

import { INFO } from "./const";

class Info extends Command {
  public override define() {
    return {
      data: INFO,
      sendTyping: false
    };
  }

  public override async execute({ bot, sender, getBotName }: CommandContext) {
    const guildCnt = bot.client.guilds.cache.size;

    const botAvatarURL = bot.client.user.displayAvatarURL();
    const embed = new EmbedBuilder({
      author: {
        name: getBotName(),
        iconURL: botAvatarURL
      },
      description: [
        INFO.GUILD_CNT(guildCnt),
        INFO.DEV_SERVER(env.BOT_DEV_SERVER_INVITE)
      ].join("\n"),
      color: COLOR.BOT,
      thumbnail: botAvatarURL,
      footer: {
        text: env.BOT_GITHUB_URL,
        iconURL: INFO.GITHUB_ICON_URL
      }
    });

    await sender.send(embed);
  }
}

export default Info;
