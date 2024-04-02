import axios from "axios";

import { SEARCH_BY_GAME_NAME_PARAMS, SEARCH_BY_GAME_NAME_URL } from "../const";

export const getGames = async (searchText: string): Promise<Array<{
  id: string;
  name: string;
  tiny_image: string;
}>> => await axios.get(
  SEARCH_BY_GAME_NAME_URL,
  { params: SEARCH_BY_GAME_NAME_PARAMS(searchText) }
).then(body => {
  if (body.data && body.data.total) {
    const games = body.data.items;
    return games;
  } else {
    return [];
  }
}).catch(() => []);
