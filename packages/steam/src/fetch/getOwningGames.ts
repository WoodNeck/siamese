import axios, { type AxiosResponse } from "axios";

import { userCache } from "../cache";
import { OWNING_GAME_PARAMS, OWNING_GAME_URL } from "../const";

import type { SteamGame } from "../types";

export const getOwningGames = async (userID: string): Promise<SteamGame[] | null> => {
  if (userCache.has(userID)) {
    return userCache.get<SteamGame[]>(userID)!;
  } else {
    return await axios.get(
      OWNING_GAME_URL,
      { params: OWNING_GAME_PARAMS(userID) }
    ).then((body: AxiosResponse<{
      response: {
        games: SteamGame[]
      } | null
    }>) => {
      if (body.data.response) {
        const owningGames = body.data.response;
        // sort by playtime desc
        owningGames.games = owningGames.games
          .sort((game1, game2) => game2.playtime_forever - game1.playtime_forever);

        userCache.set<SteamGame[]>(userID, owningGames.games);

        return owningGames.games;
      }
      return null;
    }).catch(() => null);
  }
};
