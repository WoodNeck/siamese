import axios, { type AxiosResponse } from "axios";

import { RECENT_GAME_PARAMS, RECENT_GAME_URL } from "../const";

import type { SteamGame } from "../types";

export const getRecentlyPlayedGame = async (userID: string): Promise<SteamGame[] | null> => {
  return await axios.get(
    RECENT_GAME_URL,
    { params: RECENT_GAME_PARAMS(userID) }
  ).then((body: AxiosResponse<{ response: { games: SteamGame[] } }>) => body.data.response.games)
    .catch(() => null);

};
