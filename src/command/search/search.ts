import { MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { google } from "googleapis";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu from "~/core/Menu";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import * as COLOR from "~/const/color";
import { SEARCH } from "~/const/command/search";
import { rgbaToHex, toValidURL } from "~/util/helper";

export default new Command({
  name: SEARCH.CMD,
  description: SEARCH.DESC,
  usage: SEARCH.USAGE,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.ADD_REACTIONS,
    PERMISSION.READ_MESSAGE_HISTORY,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_USER(3),
  slashData: new SlashCommandBuilder()
    .setName(SEARCH.CMD)
    .setDescription(SEARCH.DESC)
    .addStringOption(option => option
      .setName(SEARCH.USAGE_OPTION)
      .setDescription(SEARCH.DESC_OPTION)
      .setRequired(true)
    ) as SlashCommandBuilder,
  execute: async ctx => {
    const { bot } = ctx;

    const content = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(SEARCH.USAGE_OPTION, true)
      : ctx.content;

    if (!content) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_CONTENT);
    }

    const searchResult = await google.customsearch("v1").cse.list({
      q: content,
      key: bot.env.GOOGLE_API_KEY,
      cx: bot.env.GOOGLE_SEARCH_ENGINE_ID
    }).then(res => res.data.items) as SearchResult[];

    if (searchResult.length <= 0) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_RESULT(SEARCH.TARGET));
    }

    const pages = searchResult
      .map(result => {
        const embed = new MessageEmbed()
          .setTitle(result.title)
          .setThumbnail(toValidURL(
            result.pagemap?.cse_image?.[0].src
            || result.pagemap?.cse_thumbnail?.[0].src
            || result.pagemap?.imageobject?.[0].src
            || ""))
          .setURL(toValidURL(result.link));

        if (result.snippet) {
          embed.setDescription(result.snippet);
        }

        const metatags = result.pagemap?.metatags?.[0];
        if (metatags) {
          embed.setColor(
            rgbaToHex(metatags["theme-color"] || metatags["msapplication-tilecolor"] || COLOR.BOT)
          ).setFooter({
            text: metatags["og:site_name"]
            || metatags["application-name"]
            || metatags["msapplication-tooltip"]
            || metatags["al:android:app_name"]
            || metatags["al:ios:app_name"]
            || "",
            iconURL: toValidURL(metatags["msapplication-tileimage"] || "")
          });
        }

        return embed;
      });

    const menu = new Menu(ctx);
    menu.setPages(pages);
    await menu.start();
  }
});

/* eslint-disable @typescript-eslint/naming-convention */
interface SearchResult {
  kind: string;
  title: string;
  htmlTitle: string;
  link: string;
  displayLink: string;
  formattedUrl: string;
  htmlFormattedUrl: string;
  snippet?: string;
  htmlSnippet?: string;
  pagemap?: {
    metatags?: MetaTag[];
    cse_thumbnail?: Array<{
      src: string;
      width: string;
      height: string;
    }>;
    cse_image?: Array<{
      src: string;
    }>;
    imageobject?: Array<{
      src: string;
      width: string;
      height: string;
    }>;
    person?: Array<{
      name: string;
      url: string;
    }>;
    videoobject?: any[];
  };
}

interface MetaTag {
  "og:title"?: string;
  "og:description"?: string;
  "og:image"?: string;
  "og:type"?: string;
  "og:url"?: string;
  "og:site_name"?: string;
  "twitter:title"?: string;
  "twitter:description"?: string;
  "twitter:image"?: string;
  "twitter:url"?: string;
  "theme-color"?: string;
  "application-name"?: string;
  "msapplication-tooltip"?: string;
  "msapplication-tilecolor"?: string;
  "msapplication-tileimage"?: string;
  "al:android:app_name"?: string;
  "al:ios:app_name"?: string;
}
/* eslint-enable */
