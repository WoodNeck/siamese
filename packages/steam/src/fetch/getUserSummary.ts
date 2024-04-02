import axios, { type AxiosResponse } from "axios";

import { STEAM_IDS_PARAMS, SUMMARY_URL } from "../const";

import type { SteamUser } from "../types";

export const getUserSummary = async (userID: string): Promise<SteamUser | null> => {
  return await axios.get(
    SUMMARY_URL,
    { params: STEAM_IDS_PARAMS(userID) }
  ).then((body: AxiosResponse<{
    response: {
      players: SteamUser[]
    }
  }>) => body.data.response.players[0])
    .catch(() => null);
};
