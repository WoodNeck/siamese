import axios from "axios";

import { topGamesCache } from "../cache";
import { TOP_GAME_CACHE_KEY, TOP_PLAYERS_URL } from "../const";

import { getGameName } from "./getGameName";

interface TopGame {
  name: string;
  current: string;
  peak: string;
}

export const getTopGames = async () => {
  let games: TopGame[];

  if (topGamesCache.has(TOP_GAME_CACHE_KEY)) {
    games = topGamesCache.get(TOP_GAME_CACHE_KEY)!;
  } else {
    const ranks = await axios.get(TOP_PLAYERS_URL)
      .then(body => body.data.response.ranks) as Array<{
        appid: string;
        concurrent_in_game: string;
        peak_in_game: string;
      }>;

    games = await Promise.all(ranks.map(async rank => {
      const appid = rank.appid;
      const name = await getGameName(appid);

      return {
        name,
        current: rank.concurrent_in_game,
        peak: rank.peak_in_game
      };
    }));

    topGamesCache.set(TOP_GAME_CACHE_KEY, games);
  }

  return games;
};
