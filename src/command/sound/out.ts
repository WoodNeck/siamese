import SoundCommand from "~/core/sound/SoundCommand";
import { OUT } from "~/const/command/sound";
import * as ERROR from "~/const/error";


export default new SoundCommand({
  name: OUT.CMD,
  description: OUT.DESC,
  permissions: [],
  execute: async ({ msg, bot, guild }) => {
    const boomBoxes = bot.boomBoxes;

    if (boomBoxes.has(guild.id)) {
      const boomBox = boomBoxes.get(guild.id)!;

      boomBox.destroy();
    } else {
      return await bot.replyError(msg, ERROR.SOUND.NO_VOICE_CHANNEL_IN);
    }
  }
});
