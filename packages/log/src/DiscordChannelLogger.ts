import { COLOR } from "@siamese/color";
import { EmbedBuilder } from "@siamese/embed";
import { env } from "@siamese/env";
import { error } from "@siamese/log";
import * as Discord from "discord.js";

class DiscordChannelLogger {
  private _channels: {
    info: Discord.TextChannel,
    error: Discord.TextChannel
  } | null;

  public constructor() {
    this._channels = null;
  }

  public async connect(client: Discord.Client) {
    try {
      const infoChannel = await client.channels.fetch(env.BOT_LOG_INFO_CHANNEL);
      const errorChannel = await client.channels.fetch(env.BOT_LOG_ERROR_CHANNEL);

      const isValidChannel = (channel: Discord.Channel | null): channel is Discord.TextChannel => {
        return !!channel && channel.type === Discord.ChannelType.GuildText;
      };

      if (!isValidChannel(infoChannel) || !isValidChannel(errorChannel)) {
        // FIXME: 다른 샤드의 경우 채널을 못찾는게 정상임, 수정해야함
        throw new Error(`로깅 채널을 찾지 못했거나 길드 텍스트 채널이 아님, INFO: ${env.BOT_LOG_INFO_CHANNEL}, ERROR: ${env.BOT_LOG_ERROR_CHANNEL}`);
      }

      this._channels = {
        info: infoChannel,
        error: errorChannel
      };
    } catch (err) {
      const errorMsg = `로그 채널 연결 실패: ${err}`;

      error(errorMsg, { printToConsole: true });
    }
  }

  public async info(msg: EmbedBuilder) {
    if (!this._channels) {
      this._handleLogBeforeInit(msg);
      return;
    }

    if (!msg.color) msg.setColor(COLOR.INFO);
    msg.setTimestamp(new Date());

    await this._channels.info
      .send({ embeds: [msg.build()] })
      .catch(err => error(err));
  }

  public async warn(msg: EmbedBuilder) {
    if (!this._channels) {
      this._handleLogBeforeInit(msg);
      return;
    }

    if (!msg.color) msg.setColor(COLOR.WARNING);
    msg.setTimestamp(new Date());

    await this._channels.error
      .send({ embeds: [msg.build()] })
      .catch(err => error(err));
  }

  public async error(msg: EmbedBuilder | Error) {
    if (!this._channels) {
      this._handleLogBeforeInit(msg);
      return;
    }

    if (msg instanceof EmbedBuilder) {
      if (!msg.color) msg.setColor(COLOR.ERROR);
      msg.setTimestamp(new Date());

      await this._channels.error
        .send({ embeds: [msg.build()] })
        .catch(err => error(err));
    } else {
      const errorEmbed = new EmbedBuilder({
        description: `${msg}\n${msg?.stack}`,
        color: COLOR.ERROR
      });

      await this._channels.error
        .send({ embeds: [errorEmbed.build()] })
        .catch(err => error(err));
    }
  }

  private _handleLogBeforeInit(msg: EmbedBuilder | Error) {
    error(`채널 로거가 초기화되기 전에 로그 메시지를 작성하였음, ${msg}`, { printToConsole: true });
  }
}

export default DiscordChannelLogger;

