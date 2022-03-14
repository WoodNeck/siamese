import { SlashCommandBuilder } from "@discordjs/builders";
import translate from "@vitalets/google-translate-api";
import { MessageEmbed } from "discord.js";

import List from "./translate/list";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import * as PERMISSION from "~/const/permission";
import { TRANSLATE } from "~/const/command/utility";
import { parseArgs } from "~/util/helper";

export default new Command({
  name: TRANSLATE.CMD,
  description: TRANSLATE.DESC,
  usage: TRANSLATE.USAGE,
  permissions: [
    PERMISSION.EMBED_LINKS
  ],
  subcommands: [
    List
  ],
  alias: TRANSLATE.ALIAS,
  cooldown: Cooldown.PER_USER(3),
  slashData: new SlashCommandBuilder()
    .setName(TRANSLATE.CMD)
    .setDescription(TRANSLATE.DESC)
    .addStringOption(option => option
      .setName(TRANSLATE.USAGE_OPTION)
      .setDescription(TRANSLATE.DESC_OPTION)
      .setRequired(true)
    )
    .addStringOption(option => option
      .setName(TRANSLATE.LANG_OPTION)
      .setDescription(TRANSLATE.LANG_DESC)
      .setRequired(false)
    ) as SlashCommandBuilder,
  execute: async ctx => {
    const { bot } = ctx;

    let targetLangCode: string;
    let translateContent: string;

    if (ctx.isSlashCommand()) {
      const langCandidate = ctx.interaction.options.getString(TRANSLATE.LANG_OPTION)!;
      const targetLang = langCandidate in TRANSLATE.LANGS
        ? langCandidate
        : TRANSLATE.DEFAULT_LANG;

      targetLangCode = TRANSLATE.LANGS[targetLang] as string;
      translateContent = ctx.interaction.options.getString(TRANSLATE.USAGE_OPTION)!;
    } else {
      const { content } = ctx;
      const args = parseArgs(content);

      const langCandidate = args[0];
      const targetLang = langCandidate in TRANSLATE.LANGS
        ? langCandidate
        : TRANSLATE.DEFAULT_LANG;
      targetLangCode = TRANSLATE.LANGS[targetLang] as string;
      translateContent = langCandidate in TRANSLATE.LANGS
        ? content.substring(content.indexOf(" ")).trim()
        : content;

      if (!translateContent.length) {
        return bot.replyError(ctx, TRANSLATE.ERROR.NO_CONTENT);
      }
    }

    const result = await translate(translateContent, {
      to: targetLangCode
    });

    const embed = new MessageEmbed()
      .setDescription(`${EMOJI.MEMO} ${result.text}`)
      .setColor(COLOR.BOT)
      .setFooter({ text: TRANSLATE.FOOTER_FORMAT(translateContent) });

    await bot.send(ctx, { embeds: [embed] });
  }
});
