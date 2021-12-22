import translate from "@vitalets/google-translate-api";
import { MessageEmbed } from "discord.js";

import List from "./translate/list";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import * as EMOJI from "~/const/emoji";
import * as PERMISSION from "~/const/permission";
import { TRANSLATE } from "~/const/command/utility";

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
  execute: async ctx => {
    if (ctx.isSlashCommand()) return;

    const { bot, args, content } = ctx;

    const langCandidate = args[0];
    const targetLang = langCandidate in TRANSLATE.LANGS
      ? langCandidate
      : TRANSLATE.DEFAULT_LANG;
    const targetLangCode = TRANSLATE.LANGS[targetLang] as string;
    const translateContent = langCandidate in TRANSLATE.LANGS
      ? content.substring(content.indexOf(" ")).trim()
      : content;

    if (!translateContent.length) {
      return bot.replyError(ctx, TRANSLATE.ERROR.NO_CONTENT);
    }

    const result = await translate(translateContent, {
      to: targetLangCode
    });

    const embed = new MessageEmbed()
      .setDescription(`${EMOJI.MEMO} ${result.text}`);

    await bot.send(ctx, { embeds: [embed] });
  }
});
