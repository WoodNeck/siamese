import SoundCommand from "~/core/sound/SoundCommand";
import Cooldown from "~/core/Cooldown";
import * as ERROR from "~/const/error";
import * as EMOJI from "~/const/emoji";
import * as PERMISSION from "~/const/permission";
import { TTS } from "~/const/command/sound";
import TTSSong from "~/core/sound/TTSSong";

export default new SoundCommand({
  name: TTS.CMD,
  description: TTS.DESC,
  usage: TTS.USAGE,
  alias: TTS.ALIAS,
  permissions: [
    PERMISSION.CONNECT,
    PERMISSION.SPEAK,
    PERMISSION.ADD_REACTIONS,
    PERMISSION.READ_MESSAGE_HISTORY
  ],
  cooldown: Cooldown.PER_USER(3),
  sendTyping: false,
  execute: async ctx => {
    const { bot, content, msg } = ctx;

    if (!content.length) {
      return await bot.replyError(msg, ERROR.CMD.EMPTY_CONTENT(TTS.TARGET));
    }
    if (content.length > TTS.MAX_LENGTH) {
      return await bot.replyError(msg, TTS.ERROR.MESSAGE_TOO_LONG);
    }

    const song = new TTSSong(content);
    const boomBox = await bot.getBoomBox(ctx);

    if (!boomBox) return;

    boomBox.add(song);

    // Ignore error created when Siamese is blocked by the user
    await msg.react(EMOJI.MUSIC_NOTE).catch(() => void 0);

    await boomBox.play();
  }
});
