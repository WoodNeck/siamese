import axios, { type AxiosResponse } from "axios";

import { FRIEND_PARAMS, FRIEND_URL } from "../const";

import type { SteamUser } from "../types";

export const getFriendList = async (userID: string): Promise<SteamUser[] | null> => {
  return await axios.get(
    FRIEND_URL,
    { params: FRIEND_PARAMS(userID) }
  ).then((body: AxiosResponse<{
    friendslist: {
      friends: SteamUser[]
    }
  }>) => body.data.friendslist.friends)
    .catch(() => null);
};
