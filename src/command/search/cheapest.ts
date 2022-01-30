import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
import axios, { AxiosResponse } from "axios";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu from "~/core/Menu";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import { CHEAPEST } from "~/const/command/search";

export default new Command({
  name: CHEAPEST.CMD,
  description: CHEAPEST.DESC,
  usage: CHEAPEST.USAGE,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.ADD_REACTIONS,
    PERMISSION.READ_MESSAGE_HISTORY,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_USER(5),
  slashData: new SlashCommandBuilder()
    .setName(CHEAPEST.CMD)
    .setDescription(CHEAPEST.DESC)
    .addStringOption(option => option
      .setName(CHEAPEST.USAGE)
      .setDescription(CHEAPEST.DESC_OPTION)
      .setRequired(true)
    ) as SlashCommandBuilder,
  execute: async ctx => {
    const { bot } = ctx;
    const content = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(CHEAPEST.USAGE, true)
      : ctx.content;

    if (!content) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_CONTENT);
    }

    const searchText = content;
    const games = await axios.get(CHEAPEST.SEARCH_URL, {
      params: CHEAPEST.SEARCH_PARAMS(searchText)
    }).then((body: AxiosResponse<Array<{
      title: string;
      salePrice: string;
      normalPrice: string;
      isOnSale: string;
      savings: string;
      metacriticScore: string;
      metacriticLink: string;
      thumb: string;
      steamRatingText: string;
      steamRatingPercent: string;
      steamRatingCount: string;
      dealID: string;
    }>>) => body.data);

    if (!games.length) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_RESULT(CHEAPEST.TARGET));
    }

    const menu = new Menu(ctx);

    const pages = games.map(game => {
      const page = new MessageEmbed()
        .setTitle(game.title)
        .setThumbnail(game.thumb)
        .setURL(CHEAPEST.REDIRECT_URL(game.dealID));

      const metaScore = parseInt(game.metacriticScore, 10);

      if (parseInt(game.isOnSale, 10)) {
        page.setDescription(CHEAPEST.GAME_SALE_DESC(
          game.salePrice,
          game.normalPrice,
          parseInt(game.savings, 10),
          metaScore,
          game.metacriticLink
        ));
      } else {
        page.setDescription(CHEAPEST.GAME_NO_SALE_DESC(
          game.normalPrice,
        ));
      }

      if (metaScore > 0) {
        page.setColor(CHEAPEST.METASCORE_COLOR(metaScore));
      }

      if (game.steamRatingText) {
        page.setFooter(CHEAPEST.REVIEW_FOOTER(
          CHEAPEST.REVIEW_TEXT[game.steamRatingText],
          game.steamRatingPercent,
          game.steamRatingCount,
        ), CHEAPEST.REVIEW_ICON(parseInt(game.steamRatingPercent, 10)));
      }

      return page;
    });

    menu.setPages(pages);
    await menu.start();
  }
});
