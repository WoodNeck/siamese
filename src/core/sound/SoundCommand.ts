import Command from "../Command";

import * as ERROR from "~/const/error";
import CommandContext from "~/type/CommandContext";

class SoundCommand extends Command {
  public async onFail(ctx: CommandContext): Promise<void> {
    const { bot, guild } = ctx;
    const boomBoxes = bot.boomBoxes;

    if (boomBoxes.has(guild.id)) {
      const boomBox = boomBoxes.get(guild.id)!;

      boomBox.destroy();
      boomBoxes.delete(guild.id);
    }
  }

  public async checkPermissions(ctx: CommandContext): Promise<boolean> {
    const { bot, author, msg } = ctx;

    const voiceChannel = author.voice.channel;

    if (!voiceChannel) {
      await bot.replyError(msg, ERROR.SOUND.JOIN_VOICE_CHANNEL_FIRST);

      return false;
    }

    return this._checkPermissionsForChannel(voiceChannel, ctx);
  }
}

export default SoundCommand;
