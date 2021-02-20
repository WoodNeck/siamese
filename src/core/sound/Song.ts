import { Readable } from "stream";

import { StreamOptions } from "discord.js";

interface Song {
  readonly streamOptions: StreamOptions;
  fetch(): Promise<Readable>;
}

export default Song;
