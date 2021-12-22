import SoundCommand from "~/core/sound/SoundCommand";
import { OUT } from "~/const/command/sound";
import * as ERROR from "~/const/error";


export default new SoundCommand({
  name: OUT.CMD,
  description: OUT.DESC,
  permissions: [],
  sendTyping: false,
  execute: async ctx => {
    if (ctx.isSlashCommand()) return;

    const { bot, guild } = ctx;

    const boomBoxes = bot.boomBoxes;

    if (boomBoxes.has(guild.id)) {
      const boomBox = boomBoxes.get(guild.id)!;

      boomBox.destroy();
    } else {
      return await bot.replyError(ctx, ERROR.SOUND.NO_VOICE_CHANNEL_IN);
    }
  }
});
