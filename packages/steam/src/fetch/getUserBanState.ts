import axios, { type AxiosResponse } from "axios";

import { BAN_URL, STEAM_IDS_PARAMS } from "../const";

import type { SteamBanInfo } from "../types";

export const getUserBanState = async (userID: string): Promise<SteamBanInfo | null> => {
  return await axios.get(
    BAN_URL,
    { params: STEAM_IDS_PARAMS(userID) }
  ).then((body: AxiosResponse<{ players: SteamBanInfo[] }>) => body.data.players[0])
    .catch(() => null);
};
