import { env } from "@siamese/env";

export const TOP_GAME_CACHE_KEY = "TOP_CACHE_KEY";
export const SEARCH_BY_COMMUNITY_ID_URL = "http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/";
export const SEARCH_BY_GAME_NAME_URL = "https://store.steampowered.com/api/storesearch/";
export const SUMMARY_URL = "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002";
export const BAN_URL = "http://api.steampowered.com/ISteamUser/GetPlayerBans/v1";
export const RECENT_GAME_URL = "http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1";
export const LEVEL_URL = "http://api.steampowered.com/IPlayerService/GetSteamLevel/v1";
export const FRIEND_URL = "http://api.steampowered.com/ISteamUser/GetFriendList/v1";
export const OWNING_GAME_URL = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v1";
export const CURRENT_PLAYERS_URL = "http://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1";
export const TOP_PLAYERS_URL = "https://api.steampowered.com/ISteamChartsService/GetGamesByConcurrentPlayers/v1";
export const GAME_INFO_URL = "https://store.steampowered.com/api/appdetails";
export const SEARCH_BY_COMMUNITY_ID_PARAMS = (query: string) => ({
  vanityurl: query,
  key: env.STEAM_API_KEY
});
export const SEARCH_BY_GAME_NAME_PARAMS = (query: string) => ({
  term: query,
  l: "english",
  cc: "US"
});
export const STEAM_IDS_PARAMS = (id: string) => ({
  steamids: id,
  key: env.STEAM_API_KEY
});
export const RECENT_GAME_PARAMS = (id: string) => ({
  steamid: id,
  key: env.STEAM_API_KEY,
  count: 3
});
export const STEAM_ID_PARAMS = (id: string) => ({
  steamid: id,
  key: env.STEAM_API_KEY
});
export const GAME_ID_PARAMS = (id: string) => ({
  appid: id,
  key: env.STEAM_API_KEY
});
export const OWNING_GAME_PARAMS = (id: string) => ({
  steamid: id,
  key: env.STEAM_API_KEY,
  include_appinfo: "1",
  include_played_free_games: "1"
});
export const FRIEND_PARAMS = (id: string) => ({
  steamid: id,
  key: env.STEAM_API_KEY,
  relationship: "friend"
});
export const GAME_INFO_PARAMS = (id: string) => ({
  appids: id,
  cc: "us",
  l: "en"
});
