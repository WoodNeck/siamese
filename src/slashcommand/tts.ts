import { SlashCommandBuilder } from "@discordjs/builders";

import { TTS } from "~/const/command/sound";
import SlashCommand from "~/core/SlashCommand";
import TTSSong from "~/core/sound/TTSSong";
import * as ERROR from "~/const/error";

const tts = new SlashCommandBuilder()
  .setName(TTS.CMD)
  .setDescription(TTS.DESC)
  .addStringOption(option => option
    .setName(TTS.USAGE)
    .setDescription(TTS.TARGET)
    .setRequired(true)
  ) as SlashCommandBuilder;

export default new SlashCommand({
  data: tts,
  execute: async ctx => {
    const { bot, interaction, author } = ctx;
    const content = interaction.options.getString(TTS.USAGE, true);

    if (content.length > TTS.MAX_LENGTH) {
      return await interaction.reply({ content: ERROR.SOUND.MESSAGE_TOO_LONG, ephemeral: true });
    }

    const song = new TTSSong(content);
    const boomBox = await bot.getBoomBox(ctx);

    if (!boomBox) return;

    boomBox.add(song);

    await boomBox.play();

    const voiceChannel = author.voice.channel!;

    await interaction.reply({
      content: TTS.TTS_EPHEMERAL_MESSAGE(content, voiceChannel),
      ephemeral: true
    });
  }
});
