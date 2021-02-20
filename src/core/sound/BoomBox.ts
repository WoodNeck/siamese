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

  public constructor(voiceConnection: VoiceConnection) {
    super();
    this._connection = voiceConnection;
    this._songs = [];
    this._playing = false;
  }

  public destroy(): void {
    const connection = this._connection;

    if (connection.dispatcher) connection.dispatcher.end();
    connection.disconnect();
    this._songs = [];
    this._playing = false;
    this.emit("end");
  }

  public add(song: Song) {
    this._songs.push(song);
  }

  public async play() {
    if (this._playing) return;

    await this._playNextSong();

    this._playing = true;
  }

  private async _playNextSong() {
    const song = this._songs.shift();

    if (!song) return this.destroy();

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
}

export default BoomBox;
