import { Command, CommandContext, GuildOnly } from "@siamese/core";
import { tts } from "@siamese/voice";

import { TTS } from "./const";
import TTSSettings from "./sub/TTSSettings";

class TextToSpeech extends Command {
  public override define() {
    return {
      data: TTS,
      preconditions: [GuildOnly],
      subcommands: [new TTSSettings()],
      sendTyping: false,
      ephemeral: true
    };
  }

  public override async execute({ ctx, sender, getParams }: CommandContext) {
    const [text] = getParams<typeof TTS.USAGE>();
    if (!text) {
      await sender.replyError(TTS.NO_TEXT_TO_READ);
      return;
    }

    await tts(ctx, text);
  }
}

export default TextToSpeech;
