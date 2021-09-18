import {
  entersState,
  VoiceConnectionStatus,
  createAudioPlayer,
  AudioPlayerStatus
} from "@discordjs/voice";
import type {
  VoiceConnection,
  AudioPlayer
} from "@discordjs/voice";

import EventEmitter from "~/core/EventEmitter";
import Song from "~/core/sound/Song";

class BoomBox extends EventEmitter<{
  end: void;
  error: Error;
}> {
  private _connection: VoiceConnection;
  private _audioPlayer: AudioPlayer;
  private _songs: Song[];
  private _playing: boolean;
  private _destroyOnEnd: boolean;
  private _destroyTimer: NodeJS.Timeout | null;

  public constructor(voiceConnection: VoiceConnection, destroyOnEnd: boolean) {
    super();
    this._connection = voiceConnection;
    this._audioPlayer = createAudioPlayer({});
    this._songs = [];
    this._playing = false;
    this._destroyOnEnd = destroyOnEnd;
    this._destroyTimer = null;

    const audioPlayer = this._audioPlayer;

    voiceConnection.subscribe(this._audioPlayer);
    voiceConnection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(voiceConnection, VoiceConnectionStatus.Signalling, 5000),
          entersState(voiceConnection, VoiceConnectionStatus.Connecting, 5000)
        ]);
      } catch (error) {
        this.destroy();
      }
    });

    audioPlayer.on("error", err => {
      this.emit("error", err);
    });
    audioPlayer.on(AudioPlayerStatus.Idle, async () => {
      await this._playNextSong();
    });
  }

  public destroy(): void {
    const connection = this._connection;
    const audioPlayer = this._audioPlayer;

    connection.destroy();
    audioPlayer.stop();

    this._songs = [];
    this._playing = false;
    if (this._destroyTimer) {
      clearTimeout(this._destroyTimer);
    }

    this._destroyTimer = null;
    this.emit("end");
  }

  public add(song: Song) {
    this._songs.push(song);
  }

  public async play() {
    if (this._playing) return;

    const connection = this._connection;

    try {
      if (connection.state.status !== VoiceConnectionStatus.Ready) {
        await entersState(connection, VoiceConnectionStatus.Ready, 5000);
      }

      this._playing = true;
      await this._playNextSong();
    } catch (err) {
      this.emit("error", err);
      this.destroy();
    }
  }

  private async _playNextSong() {
    const song = this._songs.shift();
    const player = this._audioPlayer;

    if (!song) {
      if (this._destroyOnEnd) {
        return this.destroy();
      } else {
        return this._setDestroyTimeout();
      }
    }

    if (this._destroyTimer) {
      clearTimeout(this._destroyTimer);
      this._destroyTimer = null;
    }

    const audioResource = await song.fetch();
    player.play(audioResource);
  }

  private _setDestroyTimeout() {
    this._playing = false;
    this._destroyTimer = setTimeout(() => {
      this.destroy();
    }, 1000 * 60 * 30); // 30 minutes
  }
}

export default BoomBox;
