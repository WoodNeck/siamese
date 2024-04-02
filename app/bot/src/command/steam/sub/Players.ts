import { CommandContext, Cooldown, SubCommand } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { Menu } from "@siamese/menu";
import { getCurrentPlayers, getGames } from "@siamese/steam";

import { PLAYERS, STEAM } from "../const";

class SteamPlayers extends SubCommand {
  public override define() {
    return {
      data: PLAYERS,
      deferReply: true,
      preconditions: [
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ ctx, sender, getParams }: CommandContext) {
    const [searchText] = getParams<typeof PLAYERS.USAGE>();

    if (!searchText) {
      await sender.replyError(STEAM.ERROR.EMPTY_GAME_NAME);
      return;
    }

    const games = await getGames(searchText);
    if (!games.length) {
      await sender.replyError(STEAM.ERROR.GAME_NOT_FOUND);
      return;
    }

    const getAllCurrentPlayers = games.map(async game => getCurrentPlayers(game.id));
    const currentPlayers = await Promise.all(getAllCurrentPlayers);

    const menu = new Menu({ ctx });
    const pages = games.map((game, idx) => {
      const currentPlayer = currentPlayers[idx];

      const page = new EmbedBuilder({
        title: game.name,
        description: PLAYERS.CURRENT(currentPlayer),
        url: STEAM.STORE_URL(game.id)
      });

      if (game.tiny_image) {
        page.setThumbnail(game.tiny_image);
      }

      return page;
    });

    menu.setEmbedPages(pages);

    await menu.start();
  }
}

export default SteamPlayers;
