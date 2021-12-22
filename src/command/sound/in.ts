import SoundCommand from "~/core/sound/SoundCommand";
import { IN } from "~/const/command/sound";
import GuildConfig, { GuildConfigDocument } from "~/model/GuildConfig";

export default new SoundCommand({
  name: IN.CMD,
  description: IN.DESC,
  permissions: [],
  sendTyping: false,
  execute: async ctx => {
    if (ctx.isSlashCommand()) return;

    const { bot, guild } = ctx;

    const guildConfig = await GuildConfig.findOne({ guildID: guild.id }).lean() as GuildConfigDocument;

    if (!guildConfig || guildConfig.voiceAutoOut) {
      return await bot.replyError(ctx, IN.CANT_PERFORM_ON_VOICE_AUTO_OUT);
    }

    const boomBox = await bot.getBoomBox(ctx);

    if (!boomBox) return;

    await boomBox.play();
  }
});
