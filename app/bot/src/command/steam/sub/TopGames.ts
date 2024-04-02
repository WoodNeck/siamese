import { CommandContext, Cooldown, SubCommand } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { Menu } from "@siamese/menu";
import { getTopGames } from "@siamese/steam";

import { STEAM, TOP } from "../const";

class SteamTopGames extends SubCommand {
  public override define() {
    return {
      data: TOP,
      deferReply: true,
      preconditions: [
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ ctx }: CommandContext) {
    const games = await getTopGames();
    const perPage = TOP.GAMES_PER_PAGE;
    const maxPage = games.length / perPage;
    const pages: EmbedBuilder[] = [];

    for (let pageNum = 0; pageNum < maxPage; pageNum++) {
      const gamesSliced = games.slice(perPage * pageNum, perPage * (pageNum + 1));
      const page = new EmbedBuilder();

      gamesSliced.forEach((game, index) => page.addField(
        TOP.GAME_TITLE(perPage * pageNum + index + 1, game.name),
        TOP.GAME_STATISTICS(game.current, game.peak)
      ));
      page.setFooter({
        text: TOP.FORMAT_INFO,
        iconURL: STEAM.ICON_URL
      });

      pages.push(page);
    }

    const menu = new Menu({ ctx });
    menu.setEmbedPages(pages);

    await menu.start();
  }
}

export default SteamTopGames;
