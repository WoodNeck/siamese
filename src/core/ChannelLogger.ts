import Discord, { MessageEmbed } from "discord.js";

import Siamese from "~/Siamese";
import CommandContext from "~/core/CommandContext";
import SlashCommandContext from "~/core/SlashCommandContext";
import { dedent } from "~/util/helper";
import * as ERROR from "~/const/error";
import * as COLOR from "~/const/color";

class ChannelLogger {
  private _channels: {
    INFO: Discord.TextChannel;
    ERROR: Discord.TextChannel;
  };

  public async setChannels(bot: Siamese, channelIds: {
    info: string;
    error: string;
  }) {
    const verboseChannel = await bot.channels.fetch(channelIds.info);
    const errorChannel = await bot.channels.fetch(channelIds.error);
    this._channels = {
      INFO: verboseChannel as Discord.TextChannel,
      ERROR: errorChannel as Discord.TextChannel
    };
  }

  public async info(msg: MessageEmbed) {
    if (!msg.color) msg.setColor(COLOR.INFO);
    msg.setTimestamp(new Date());

    await this._channels.INFO.send({ embeds: [msg] })
      .catch(err => console.error(err));
  }

  public async warn(msg: MessageEmbed) {
    if (!msg.color) msg.setColor(COLOR.WARNING);
    msg.setTimestamp(new Date());

    await this._channels.ERROR.send({ embeds: [msg] })
      .catch(err => console.error(err));
  }

  // Helper function for formatted error logging
  public async error(err: Error, ctx?: CommandContext | SlashCommandContext) {
    const log = new MessageEmbed();

    if (ctx && !ctx.isSlashCommand()) {
      const { msg } = ctx;

      log.setTitle(ERROR.CMD.FAIL_TITLE(err).substring(0, 256))
        .setDescription(dedent`
          ${ERROR.CMD.FAIL_PLACE(msg.channel, msg.guild)}
          ${ERROR.CMD.FAIL_CMD(msg.content)}
          ${ERROR.CMD.FAIL_DESC(err)}`.substring(0, 2048));
    } else {
      log.setTitle(ERROR.CMD.FAIL_TITLE(err))
        .setDescription(ERROR.CMD.FAIL_DESC(err));
    }
    log.setColor(COLOR.ERROR);

    await this._channels.ERROR.send({ embeds: [log] })
      .catch(error => console.error(error));
  }
}

export default ChannelLogger;
