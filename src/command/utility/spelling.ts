/* eslint-disable @typescript-eslint/naming-convention */
import { MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import axios from "axios";
import * as cheerio from "cheerio";
import chalk from "chalk";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import * as COLOR from "~/const/color";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import { SPELLING } from "~/const/command/utility";
import { block } from "~/util/markdown";

export default new Command({
  name: SPELLING.CMD,
  description: SPELLING.DESC,
  usage: SPELLING.USAGE,
  permissions: [
    PERMISSION.EMBED_LINKS
  ],
  cooldown: Cooldown.PER_USER(3),
  slashData: new SlashCommandBuilder()
    .setName(SPELLING.CMD)
    .setDescription(SPELLING.DESC)
    .addStringOption(option => option
      .setName(SPELLING.USAGE)
      .setDescription(SPELLING.USAGE_DESC)
      .setRequired(true)
    ) as SlashCommandBuilder,
  execute: async ctx => {
    const { bot } = ctx;

    const content = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(SPELLING.USAGE, true)
      : ctx.content;

    if (!content) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_CONTENT);
    }

    const result = await axios.get(SPELLING.API_URL, {
      params: {
        q: content,
        ...SPELLING.COMMON_PARAMS
      }
    }).then(res => res?.data?.message?.result) as {
      errata_count: number;
      origin_html: string;
      html: string;
      notag_html: string;
    } | null;

    if (!result) {
      return await bot.replyError(ctx, ERROR.SEARCH.FAILED);
    }

    const parsed = parseSpellingHTML(result.html);

    const embed = new MessageEmbed();
    embed.setColor(COLOR.BOT);

    if (result.errata_count > 0) {
      const fixed = block(parsed, "ansi");
      const description = SPELLING.RESULT_DESC;

      embed.setTitle(SPELLING.RESULT_TITLE);
      embed.setDescription(`${fixed}\n${description}`);
      embed.setFooter({ text: SPELLING.RESULT_FOOTER });
    } else {
      embed.setTitle(SPELLING.RESULT_TITLE_OKAY);
    }

    await bot.send(ctx, {
      embeds: [embed]
    });
  }
});

const parseSpellingHTML = (html: string) => {
  const $ = cheerio.load(html);

  $("em").each((_, el) => {
    const element = $(el);

    if (element.hasClass("red_text")) {
      element.text(chalk.red(element.text()));
    } else if (element.hasClass("green_text")) {
      element.text(chalk.green(element.text()));
    } else if (element.hasClass("blue_text")) {
      element.text(chalk.blue(element.text()));
    } else if (element.hasClass("violet_text")) {
      element.text(chalk.yellow(element.text()));
    }
  });

  $("br").each((_, el) => {
    const element = $(el);

    element.replaceWith("\n");
  });

  return $.text();
};
