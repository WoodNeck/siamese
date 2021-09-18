import { AudioResource } from "@discordjs/voice";

interface Song {
  fetch(): Promise<AudioResource>;
}

export default Song;
