import axios, { type AxiosResponse } from "axios";

import { LEVEL_URL, STEAM_ID_PARAMS } from "../const";

export const getUserLevel = async (userID: string): Promise<number | null> => {
  return await axios.get(
    LEVEL_URL,
    { params: STEAM_ID_PARAMS(userID) }
  ).then((body: AxiosResponse<{
    response: {
      player_level: number
    }
  }>) => body.data.response.player_level)
    .catch(() => null);
};
