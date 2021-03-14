import { MessageEmbed } from "discord.js";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu from "~/core/Menu";
import { getGames, getCurrentPlayers } from "~/command/steam/api";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import { STEAM, PLAYERS } from "~/const/command/steam";

export default new Command({
  name: PLAYERS.CMD,
  description: PLAYERS.DESC,
  usage: PLAYERS.USAGE,
  alias: PLAYERS.ALIAS,
  permissions: [
    PERMISSION.EMBED_LINKS
  ],
  cooldown: Cooldown.PER_USER(5),
  execute: async ctx => {
    const { bot, msg, content } = ctx;

    if (!content) {
      return await bot.replyError(msg, ERROR.SEARCH.EMPTY_CONTENT);
    }

    const games = await getGames(content);
    if (!games.length) {
      return await bot.replyError(msg, ERROR.SEARCH.EMPTY_RESULT(PLAYERS.TARGET));
    }

    const getAllCurrentPlayers = games.map(async game => getCurrentPlayers(bot, game.id));

    const currentPlayers = await Promise.all(getAllCurrentPlayers);

    const menu = new Menu(ctx, { maxWaitTime: PLAYERS.RECITAL_TIME });
    const pages = games.map((game, idx) => {
      const currentPlayer = currentPlayers[idx];

      const page = new MessageEmbed()
        .setTitle(game.name)
        .setDescription(PLAYERS.CURRENT(currentPlayer))
        .setURL(STEAM.STORE_URL(game.id));
      if (game.tiny_image) {
        page.setThumbnail(game.tiny_image);
      }
      return page;
    });

    menu.setPages(pages);

    await menu.start();
  }
});
