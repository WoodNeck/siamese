import axios, { type AxiosResponse } from "axios";

import { CURRENT_PLAYERS_URL, GAME_ID_PARAMS } from "../const";

export const getCurrentPlayers = async (appID: string): Promise<string> => {
  return await axios.get(
    CURRENT_PLAYERS_URL,
    { params: GAME_ID_PARAMS(appID) }
  ).then((body: AxiosResponse<{
    response: {
      player_count: string;
    } | null
  }>) => {
    return body.data.response
      ? body.data.response.player_count
      : "N/A";
  }).catch(() => "N/A");
};
