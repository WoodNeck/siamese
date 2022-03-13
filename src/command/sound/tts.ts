import { SlashCommandBuilder } from "@discordjs/builders";

import SoundCommand from "~/core/sound/SoundCommand";
import Cooldown from "~/core/Cooldown";
import TTSSong from "~/core/sound/TTSSong";
import * as ERROR from "~/const/error";
import * as EMOJI from "~/const/emoji";
import * as PERMISSION from "~/const/permission";
import { TTS } from "~/const/command/sound";

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
  slashData: new SlashCommandBuilder()
    .setName(TTS.CMD)
    .setDescription(TTS.DESC)
    .addStringOption(option => option
      .setName(TTS.USAGE)
      .setDescription(TTS.TARGET)
      .setRequired(true)
    ) as SlashCommandBuilder,
  execute: async ctx => {
    const { bot, author } = ctx;
    const content = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(TTS.USAGE, true)
      : ctx.content;

    if (!content.length) {
      return await bot.replyError(ctx, ERROR.CMD.EMPTY_CONTENT(TTS.TARGET));
    }
    if (content.length > TTS.MAX_LENGTH) {
      return await bot.replyError(ctx, ERROR.SOUND.MESSAGE_TOO_LONG);
    }

    const song = new TTSSong(content);
    const boomBox = await bot.getBoomBox(ctx);

    if (!boomBox) return;

    boomBox.add(song);
    await boomBox.play();

    if (ctx.isSlashCommand()) {
      const voiceChannel = author.voice.channel!;

      await ctx.interaction.reply({
        content: TTS.TTS_EPHEMERAL_MESSAGE(content, voiceChannel),
        ephemeral: true
      }).catch(() => void 0);
    } else {
      // Ignore error created when Siamese is blocked by the user
      await ctx.msg.react(EMOJI.MUSIC_NOTE).catch(() => void 0);
    }
  }
});
