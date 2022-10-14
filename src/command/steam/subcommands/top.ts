import { MessageEmbed } from "discord.js";
import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import axios from "axios";
import NodeCache from "node-cache";

import { getGameName } from "../api";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu from "~/core/Menu";
import * as PERMISSION from "~/const/permission";
import { STEAM, TOP } from "~/const/command/steam";

const topGamesCache = new NodeCache({ stdTTL: 60 * 60, useClones: false });
const CACHE_KEY = "STEAM_CACHE_KEY";

export default new Command({
  name: TOP.CMD,
  description: TOP.DESC,
  permissions: [
    PERMISSION.EMBED_LINKS
  ],
  cooldown: Cooldown.PER_USER(5),
  slashData: new SlashCommandSubcommandBuilder()
    .setName(TOP.CMD)
    .setDescription(TOP.DESC),
  execute: async ctx => {
    let games: Array<{
      name: string;
      current: string;
      peak: string;
    }>;
    if (topGamesCache.has(CACHE_KEY)) {
      games = topGamesCache.get(CACHE_KEY)!;
    } else {
      const ranks = await axios.get(STEAM.TOP_PLAYERS_URL).then(body => body.data.response.ranks);

      games = await Promise.all(ranks.map(rank => {
        return new Promise(async resolve => {
          const appid = rank.appid;

          const name = await getGameName(appid);

          resolve({
            name,
            current: rank.concurrent_in_game,
            peak: rank.peak_in_game
          });
        });
      }));

      topGamesCache.set(CACHE_KEY, games);
    }

    const perPage = TOP.GAMES_PER_PAGE;
    const maxPage = games.length / perPage;
    const pages: MessageEmbed[] = [];

    for (let pageNum = 0; pageNum < maxPage; pageNum++) {
      const gamesSliced = games.slice(perPage * pageNum, perPage * (pageNum + 1));
      const page = new MessageEmbed();

      gamesSliced.forEach((game, index) => page.addField(
        TOP.GAME_TITLE(perPage * pageNum + index + 1, game.name),
        TOP.GAME_STATISTICS(game.current, game.peak),
      ));
      page.setFooter({
        text: TOP.FORMAT_INFO,
        iconURL: STEAM.ICON_URL
      });

      pages.push(page);
    }

    const menu = new Menu(ctx);
    menu.setPages(pages);

    await menu.start();
  }
});
