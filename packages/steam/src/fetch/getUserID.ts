import axios from "axios";

import { SEARCH_BY_COMMUNITY_ID_PARAMS, SEARCH_BY_COMMUNITY_ID_URL, STEAM_IDS_PARAMS, SUMMARY_URL } from "../const";

export const getUserID = async (searchText: string): Promise<string | null> => {
  const searchByCommunityId = axios.get(
    SEARCH_BY_COMMUNITY_ID_URL,
    { params: SEARCH_BY_COMMUNITY_ID_PARAMS(searchText) }
  ).then(body => body.data.response.success === 1
    ? body.data.response.steamid
    : null
  );

  // STEAM 64-bit ID could given as parameter
  const searchByIdItself = /^[0-9]*$/.test(searchText)
    ? axios.get(
      SUMMARY_URL,
      { params: STEAM_IDS_PARAMS(searchText) }
    ).then(body => body.data.response.players[0])
      .catch(() => null)
    : new Promise<void>(resolve => { resolve(); });

  // return userId if community id search matched
  // return parameter itself when it's correct 64-bit encoded steam id
  // else return undefined
  const [userId, userDetail] = await Promise.all([searchByCommunityId, searchByIdItself]);
  if (userId) {
    return userId;
  } else if (userDetail) {
    return searchText;
  }

  return null;
};
