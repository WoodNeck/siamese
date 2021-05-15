import { VoiceConnection } from "discord.js";

import EventEmitter from "~/core/EventEmitter";
import Song from "~/core/sound/Song";

class BoomBox extends EventEmitter<{
  end: void;
  error: Error;
}> {
  private _connection: VoiceConnection;
  private _songs: Song[];
  private _playing: boolean;
  private _destroyOnEnd: boolean;
  private _destroyTimer: NodeJS.Timeout | null;

  public constructor(voiceConnection: VoiceConnection, destroyOnEnd: boolean) {
    super();
    this._connection = voiceConnection;
    this._songs = [];
    this._playing = false;
    this._destroyOnEnd = destroyOnEnd;
    this._destroyTimer = null;

    voiceConnection.on("disconnect", () => {
      this.emit("end");
    });
  }

  public destroy(): void {
    const connection = this._connection;

    if (connection.dispatcher) connection.dispatcher.end();
    connection.disconnect();
    this._songs = [];
    this._playing = false;
    if (this._destroyTimer) {
      clearTimeout(this._destroyTimer);
    }
    this._destroyTimer = null;
  }

  public add(song: Song) {
    this._songs.push(song);
  }

  public async play() {
    if (this._playing) return;

    this._playing = true;
    await this._playNextSong();
  }

  private async _playNextSong() {
    const song = this._songs.shift();

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

    const stream = await song.fetch();
    const dispatcher = this._connection.play(stream, song.streamOptions);

    dispatcher.on("start", () => {
      // 'pausedTime' is carried on new dispatcher
      // Should manually set it for 0 to get 0-delay stream after pausing
      // https://github.com/discordjs/discord.js/issues/1693#issuecomment-317301023
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (this._connection.player as any).streamingData.pausedTime = 0;
    });

    dispatcher.on("error", err => {
      this.emit("error", err);
    });

    dispatcher.on("finish", async () => {
      await this._playNextSong();
    });
  }

  private _setDestroyTimeout() {
    this._playing = false;
    this._destroyTimer = setTimeout(() => {
      this.destroy();
    }, 1000 * 60 * 30); // 30 minutes
  }
}

export default BoomBox;
