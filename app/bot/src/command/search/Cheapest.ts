import { Command, CommandContext, Cooldown } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { Menu } from "@siamese/menu";

import { CHEAPEST } from "./const";

class Cheapest extends Command {
  public override define() {
    return {
      data: CHEAPEST,
      deferReply: true,
      preconditions: [
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ sender, ctx, getParams }: CommandContext) {
    const [searchText] = getParams<typeof CHEAPEST.USAGE>();

    if (!searchText) {
      await sender.replyError(CHEAPEST.EMPTY_CONTENT);
      return;
    }

    const games = await this._searchGames(searchText);
    if (games.length <= 0) {
      await sender.replyError(CHEAPEST.EMPTY_RESULT);
      return;
    }

    const menu = new Menu({ ctx });

    const pages = games.map(game => {
      const page = new EmbedBuilder({
        title: game.title,
        thumbnail: game.thumb,
        url: CHEAPEST.REDIRECT_URL(game.dealID)
      });

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
          game.normalPrice
        ));
      }

      if (metaScore > 0) {
        page.setColor(CHEAPEST.METASCORE_COLOR(metaScore));
      }

      if (game.steamRatingText) {
        page.setFooter({
          text: CHEAPEST.REVIEW_FOOTER(
            CHEAPEST.REVIEW_TEXT[game.steamRatingText],
            game.steamRatingPercent,
            game.steamRatingCount
          ),
          iconURL: CHEAPEST.REVIEW_ICON(parseInt(game.steamRatingPercent, 10))
        });
      }

      return page;
    });

    menu.setEmbedPages(pages);
    await menu.start();
  }

  private async _searchGames(searchText: string) {
    const searchURL = `${CHEAPEST.SEARCH_URL}?${new URLSearchParams(CHEAPEST.SEARCH_PARAMS(searchText))}`;
    const data = await (await fetch(searchURL)).json() as Array<{
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
    }>;

    return data;
  }
}

export default Cheapest;
