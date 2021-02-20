import toReadableStream from "to-readable-stream";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

import Song from "./Song";

import { TTS } from "~/const/command/sound";

class TTSSong implements Song {
  public readonly streamOptions = {
    type: "ogg/opus",
    bitrate: "auto",
    fec: true,
    plp: 0
  } as const;

  private _content: string;

  public constructor(content: string) {
    this._content = content;
  }

  public async fetch() {
    const ttsClient = new TextToSpeechClient();
    const [response] = await ttsClient.synthesizeSpeech({
      input: { text: this._content },
      voice: { languageCode: TTS.LANGUAGE },
      audioConfig: { audioEncoding: "OGG_OPUS" }
    });

    return toReadableStream(response.audioContent as Uint8Array);
  }
}

export default TTSSong;
