import { joinVoiceChannel, VoiceConnection as DiscordVoiceConnection, VoiceConnectionStatus, entersState, createAudioPlayer, NoSubscriberBehavior, AudioPlayer, createAudioResource, AudioResource, AudioPlayerStatus, AudioPlayerError } from "@discordjs/voice";
import { COLOR } from "@siamese/color";
import { EmbedBuilder } from "@siamese/embed";
import { error } from "@siamese/log";
import fs from "fs-extra";

import { connections } from "./connections";
import { ERROR } from "./const";
import { toTempMp3Path } from "./utils";

import type { Channel, Guild, TextBasedChannel } from "discord.js";

class VoiceSession {
  private _textChannel: TextBasedChannel;
  private _voiceChannel: Channel;
  private _guild: Guild;
  private _connection: DiscordVoiceConnection;
  private _player: AudioPlayer;
  private _queue: AudioResource[];
  private _playingResource: AudioResource | null;
  private _leaveTimer: NodeJS.Timeout | null;
  private _destroyed: boolean;

  public constructor(voiceChannel: Channel, textChannel: TextBasedChannel, guild: Guild) {
    this._voiceChannel = voiceChannel;
    this._textChannel = textChannel;
    this._guild = guild;

    this._connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator
    });
    this._player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play
      }
    });
    this._connection.subscribe(this._player);
    this._queue = [];
    this._playingResource = null;
    this._leaveTimer = null;
    this._destroyed = false;

    connections.set(guild.id, this);
    this._addEventHandlers();
  }

  public destroy() {
    if (this._destroyed) return;

    this._destroyed = true;

    this._removeEventHandlers();
    this._player.stop();
    this._connection.destroy();
    connections.delete(this._guild.id);

    // 리소스 전부 정리
    const removingResources = this._queue;
    if (this._playingResource) {
      removingResources.push(this._playingResource);
    }

    removingResources.forEach(resource => {
      this._removeResource(resource);
    });

    this._playingResource = null;
    this._queue = [];
  }

  public inVoiceChannel(id: string) {
    return this._voiceChannel.id === id;
  }

  public getVoiceChannel() {
    return this._voiceChannel;
  }

  public getQueuedLength() {
    return this._queue.length;
  }

  public queueLocalMp3File(id: string, name: string) {
    const filePath = toTempMp3Path(id);
    const resource = createAudioResource(filePath, {
      metadata: {
        name,
        path: filePath
      }
    });

    this._queue.push(resource);
  }

  public async playAudio() {
    if (this._player.state.status !== AudioPlayerStatus.Idle) {
      // 이미 재생중
      return;
    }

    this._playNextResource();
  }

  /**
   * @throws {Error}
   */
  public async waitForReady() {
    const connection = this._connection;

    if (connection.state.status === VoiceConnectionStatus.Ready) {
      return;
    }

    await Promise.race([
      entersState(connection, VoiceConnectionStatus.Ready, 5_000)
    ]);
  }

  private _addEventHandlers() {
    const connection = this._connection;
    const player = this._player;

    connection.on(VoiceConnectionStatus.Disconnected, this._onDisconnect);

    player.on(AudioPlayerStatus.Idle, this._playNextResource);
    player.on("error", this._onPlayerError);
  }

  private _removeEventHandlers() {
    const connection = this._connection;

    connection.off(VoiceConnectionStatus.Disconnected, this._onDisconnect);
  }

  private _onDisconnect = async () => {
    const connection = this._connection;

    try {
      await Promise.race([
        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
        entersState(connection, VoiceConnectionStatus.Connecting, 5_000)
      ]);
    } catch (err) {
      this.destroy();
      error(new Error(`음성 채널 연결 종료: ${err}`));
      await this._sendUnexpectedDisconnectMsg();
    }
  };

  private async _sendUnexpectedDisconnectMsg() {
    const channel = this._textChannel;

    await channel.send(ERROR.UNEXPECTED_DISCONNECT)
      .catch(() => void 0);
  }

  private _playNextResource = () => {
    // 기존에 재생하던 리소스 제거
    const prevResource = this._playingResource;
    if (prevResource) {
      this._removeResource(prevResource);
      this._playingResource = null;
    }

    const resource = this._queue.shift();
    if (!resource) {
      // 리소스가 없을 경우 5분 뒤에 음성 채널에서 나가도록 설정
      this._leaveTimer = setTimeout(() => {
        this.destroy();
      }, 5 * 60 * 1000) as NodeJS.Timeout;
    } else {
      this._playingResource = resource;
      this._player.play(resource);

      // 기존 타이머 제거
      if (this._leaveTimer) {
        clearTimeout(this._leaveTimer);
        this._leaveTimer = null;
      }
    }
  };

  private _removeResource(resource: AudioResource) {
    const metadata = resource.metadata as { name: string, path: string };

    fs.rm(metadata.path).catch(err => {
      error(`음성 리소스 삭제 실패: ${err}`);
    });
  }

  private _onPlayerError = async (err: AudioPlayerError) => {
    const channel = this._textChannel;
    const metadata = err.resource.metadata as { name: string, path: string };
    const errorEmbed = new EmbedBuilder({
      title: ERROR.FAILED_TO_PLAY_RESOURCE,
      description: err.message,
      color: COLOR.ERROR
    });
    errorEmbed.addField(ERROR.FAILED_TO_PLAY_RESOURCE_NAME, metadata.name);

    // 재생 불가 에러 전송
    await channel.send({ embeds: [errorEmbed.build()] })
      .catch(() => void 0);
    error(`음성 리소스 재생 불가: ${err.message}, ${metadata.name}`);
  };
}

export default VoiceSession;
