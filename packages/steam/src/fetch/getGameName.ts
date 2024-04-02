import axios, { type AxiosResponse } from "axios";

import { GAME_INFO_PARAMS, GAME_INFO_URL } from "../const";

export const getGameName = async (appID: string): Promise<string> => {
  return await axios.get(
    GAME_INFO_URL,
    { params: GAME_INFO_PARAMS(appID) }
  ).then((body: AxiosResponse<{
    [key: string]: {
      success: boolean;
      data: {
        name: string;
      }
    }
  }>) => {
    const appData = body.data[appID];
    return appData.success ? appData.data.name : "??";
  });
};
