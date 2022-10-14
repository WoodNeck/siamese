/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import axios from "axios";
import NodeCache from "node-cache";

import Siamese from "~/Siamese";
import { STEAM } from "~/const/command/steam";

// 1 hour
const userGameCache = new NodeCache({ stdTTL: 60 * 60, useClones: false });

interface SteamUser {
  personaname: string;
  profileurl: string;
  avatarmedium: string;
  personastate: number;
  lastlogoff: number;
  timecreated: number;
  gameextrainfo?: string;
  loccountrycode?: string;
}

interface SteamBanInfo {
  CommunityBanned: boolean;
  VACBanned: boolean;
  NumberOfGameBans: number;
  EconomyBan: string;
}

interface SteamGame {
  name: string;
  appid: string;
  img_icon_url: string;
  img_logo_url: string;
  playtime_forever: number;
  playtime_2weeks: number;
}

export const getUserId = async (bot: Siamese, searchText: string): Promise<string | null> => {
  const searchByCommunityId = axios.get(
    STEAM.SEARCH_BY_COMMUNITY_ID_URL,
    { params: STEAM.SEARCH_BY_COMMUNITY_ID_PARAMS(bot.env, searchText) }
  ).then(body => body.data.response.success === 1
    ? body.data.response.steamid
    : null
  );

  // STEAM 64-bit ID could given as parameter
  const searchByIdItself = /^[0-9]*$/.test(searchText)
    ? axios.get(
      STEAM.SUMMARY_URL,
      { params: STEAM.STEAM_IDS_PARAMS(bot.env, searchText) }
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

export const getGames = async (searchText: string): Promise<Array<{
  id: string;
  name: string;
  tiny_image: string;
}>> => await axios.get(
  STEAM.SEARCH_BY_GAME_NAME_URL,
  { params: STEAM.SEARCH_BY_GAME_NAME_PARAMS(searchText) }
).then(body => {
  if (body.data && body.data.total) {
    const games = body.data.items;
    return games;
  } else {
    return [];
  }
}).catch(() => []);

export const getUserSummary = async (bot: Siamese, userId: string): Promise<SteamUser | null> => await axios.get(
  STEAM.SUMMARY_URL,
  { params: STEAM.STEAM_IDS_PARAMS(bot.env, userId) }
).then(body => body.data.response.players[0])
  .catch(() => null);

export const getUserBanState = async (bot: Siamese, userId: string): Promise<SteamBanInfo | null> => await axios.get(
  STEAM.BAN_URL,
  { params: STEAM.STEAM_IDS_PARAMS(bot.env, userId) }
).then(body => body.data.players[0])
  .catch(() => null);

export const getRecentlyPlayedGame = async (bot: Siamese, userId: string): Promise<SteamGame[] | null> => await axios.get(
  STEAM.RECENT_GAME_URL,
  { params: STEAM.RECENT_GAME_PARAMS(bot.env, userId) }
).then(body => body.data.response.games)
  .catch(() => null);

export const getUserLevel = async (bot: Siamese, userId: string): Promise<number | null> => await axios.get(
  STEAM.LEVEL_URL,
  { params: STEAM.STEAM_ID_PARAMS(bot.env, userId) }
).then(body => body.data.response.player_level)
  .catch(() => null);

export const getFriendList = async (bot: Siamese, userId: string): Promise<any[] | null> => await axios.get(
  STEAM.FRIEND_URL,
  { params: STEAM.FRIEND_PARAMS(bot.env, userId) }
).then(body => body.data.friendslist.friends)
  .catch(() => null);

export const getOwningGames = async (bot: Siamese, userId: string): Promise<SteamGame[] | null> => {
  if (userGameCache.has(userId)) {
    return userGameCache.get<SteamGame[]>(userId)!;
  } else {
    return await axios.get(
      STEAM.OWNING_GAME_URL,
      { params: STEAM.OWNING_GAME_PARAMS(bot.env, userId) }
    ).then(body => {
      if (body.data.response) {
        const owningGames = body.data.response;
        // sort by playtime desc
        owningGames.games = owningGames.games
          .sort((game1, game2) => game2.playtime_forever - game1.playtime_forever);

        userGameCache.set<SteamGame[]>(userId, owningGames.games);

        return owningGames.games;
      }
      return null;
    }).catch(() => null);
  }
};

export const getCurrentPlayers = async (bot: Siamese, appid: string): Promise<string> => await axios.get(
  STEAM.CURRENT_PLAYERS_URL,
  { params: STEAM.GAME_ID_PARAMS(bot.env, appid) }
).then(body => body.data.response
  ? body.data.response.player_count
  : "N/A").catch(() => "N/A");

export const getGameName = async (appid: string): Promise<string> => await axios.get(
  STEAM.GAME_INFO_URL,
  { params: STEAM.GAME_INFO_PARAMS(appid) }
).then(body => {
  const appData = body.data[appid];
  return appData.success ? appData.data.name : "??";
});
