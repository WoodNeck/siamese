/* eslint-disable @typescript-eslint/naming-convention */
import { strong } from "~/util/markdown";
import * as EMOJI from "~/const/emoji";
import EnvVariables from "~/type/EnvVariables";

export const STEAM = {
  CMD: "스팀",
  DESC: "스팀과 관련된 내용들을 조회할 수 있는 명령어들이다냥!",
  COMMUNITY_ID_DESC: "스팀 계정의 커뮤니티 ID를 달라냥!",
  SEARCH_BY_COMMUNITY_ID_URL: "http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/",
  SEARCH_BY_GAME_NAME_URL: "https://store.steampowered.com/api/storesearch/",
  SUMMARY_URL: "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002",
  BAN_URL: "http://api.steampowered.com/ISteamUser/GetPlayerBans/v1",
  RECENT_GAME_URL: "http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1",
  LEVEL_URL: "http://api.steampowered.com/IPlayerService/GetSteamLevel/v1",
  FRIEND_URL: "http://api.steampowered.com/ISteamUser/GetFriendList/v1",
  OWNING_GAME_URL: "http://api.steampowered.com/IPlayerService/GetOwnedGames/v1",
  CURRENT_PLAYERS_URL: "http://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1",
  TOP_PLAYERS_URL: "https://api.steampowered.com/ISteamChartsService/GetGamesByConcurrentPlayers/v1",
  GAME_INFO_URL: "https://store.steampowered.com/api/appdetails",
  ICON_URL: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png",
  PROFILE_GAME_URL: baseUrl => `${baseUrl}games/?tab=all`,
  GAME_IMG_URL: (appid, url) => `http://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${url}.jpg`,
  STORE_URL: appid => `https://store.steampowered.com/app/${appid}`,
  SEARCH_BY_COMMUNITY_ID_PARAMS: (env: EnvVariables, query: string) => ({
    vanityurl: query,
    key: env.STEAM_API_KEY
  }),
  SEARCH_BY_GAME_NAME_PARAMS: (query: string) => ({
    term: query,
    l: "english",
    cc: "US"
  }),
  STEAM_IDS_PARAMS: (env: EnvVariables, id: string) => ({
    steamids: id,
    key: env.STEAM_API_KEY
  }),
  RECENT_GAME_PARAMS: (env: EnvVariables, id: string) => ({
    steamid: id,
    key: env.STEAM_API_KEY,
    count: 3
  }),
  STEAM_ID_PARAMS: (env: EnvVariables, id: string) => ({
    steamid: id,
    key: env.STEAM_API_KEY
  }),
  GAME_ID_PARAMS: (env: EnvVariables, id: string) => ({
    appid: id,
    key: env.STEAM_API_KEY
  }),
  OWNING_GAME_PARAMS: (env: EnvVariables, id: string) => ({
    steamid: id,
    key: env.STEAM_API_KEY,
    include_appinfo: "1",
    include_played_free_games: "1"
  }),
  FRIEND_PARAMS: (env: EnvVariables, id: string) => ({
    steamid: id,
    key: env.STEAM_API_KEY,
    relationship: "friend"
  }),
  GAME_INFO_PARAMS: (id: string) => ({
    appids: id,
    cc: "us",
    l: "en"
  }),
  PLAYTIME: (minute: number) => `총 플레이 시간: ${minute ? (minute / 60).toFixed(1) : 0}시간`,
  PLAYTIME_SHORT: (minute: number) => `${minute ? (minute / 60).toFixed(1) : 0}시간`,
  ERROR: {
    USER_NOT_FOUND: "그 아이디로는 유저를 찾지 못했다냥!",
    EMPTY_GAMES: "계정이 비공개거나 가진 게임이 하나도 없다냥!"
  }
} as const;

export const PROFILE = {
  CMD: "프로필",
  DESC: "프로필 정보를 요약해서 보여준다냥!",
  USAGE: "커뮤니티id",
  PERSONA_STATE: {
    0: "오프라인",
    1: "온라인",
    2: "바쁨",
    3: "자리 비움",
    4: "수면 중",
    5: "거래할 사람 찾는 중",
    6: "같이 게임해요"
  },
  PLAYING_STATE: (game: string) => `${strong(game)}플레이 중`,
  REGISTERED: (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getUTCFullYear()}년 ${date.getUTCMonth() + 1}월에 가입`;
  },
  LAST_LOGOFF: (timestamp: number) => {
    const dateDiff = new Date(new Date().getTime() - new Date(timestamp).getTime());

    const diff = {
      year: Math.floor(dateDiff.getUTCFullYear() - 1970),
      month: Math.floor(dateDiff.getUTCMonth() % 12),
      week: Math.floor(dateDiff.getUTCDate() / 7),
      // If days over 31 it won't be a problem as we're not using this value then
      day: Math.floor((dateDiff.getUTCDate() - 1) % 31),
      hour: Math.floor(dateDiff.getUTCHours() % 24),
      minute: Math.floor(dateDiff.getUTCMinutes() % 60)
    };

    const last = diff.year > 1
      ? `${diff.year}년`
      : diff.year && diff.month
        ? `${diff.year}년 ${diff.month}개월`
        : diff.month > 1
          ? `${diff.month}개월`
          : diff.week
            ? `${diff.week}주`
            : diff.day > 1
              ? `${diff.day}일`
              : diff.day && diff.hour
                ? `${diff.day}일 ${diff.hour}시간`
                : diff.hour > 1
                  ? `${diff.hour}시간`
                  : diff.hour && diff.minute
                    ? `${diff.hour}시간 ${diff.minute}분`
                    : `${Math.max(diff.minute, 1)}분`;
    return `마지막 접속: ${last} 전`;
  },
  TITLE: (name: string, flag: string) => `${flag}${name}`,
  FIELD_DETAIL: "유저 정보",
  FIELD_BAN: "밴 기록",
  FIELD_RECENT_GAME: "최근 플레이 게임 (지난 2주간)",
  BAN_COMMUNITY: "커뮤니티 밴",
  BAN_VAC: "VAC 밴",
  BAN_GAME: "게임 밴",
  BAN_ECONOMY: "거래 밴",
  LEVEL: (level: number) => `LEVEL - ${strong(level.toString())}`,
  FRIENDS: (friends: any[]) => `친구 - ${strong(friends.length.toString())}명`,
  GAMES: (gamesCount: number) => `게임 - ${strong(gamesCount.toString())}개`,
  GAME_DESC: (game: { name: string; playtime_2weeks: number }) => `${EMOJI.MIDDLE_DOT} ${strong(game.name)} - ${(game.playtime_2weeks / 60).toFixed(1)}시간`
} as const;

export const RANDOM = {
  CMD: "랜덤",
  DESC: "계정에서 무작위 게임을 가져와서 보여준다냥!",
  USAGE: "커뮤니티id"
} as const;

export const LIBRARY = {
  CMD: "라이브러리",
  DESC: "계정의 게임들을 플레이 시간이 높은 것부터 보여준다냥!",
  USAGE: "커뮤니티id",
  GAMES_PER_PAGE: 10,
  MAX_PAGES: 5
} as const;

export const PLAYERS = {
  CMD: "동접",
  DESC: "게임의 현재 접속자 수를 알려준다냥!",
  ALIAS: ["동접자수"],
  USAGE: "게임명",
  USAGE_DESC: "현재 접속자 수를 조회할 게임 이름을 달라냥!",
  TARGET: "게임",
  CURRENT: players => `현재 플레이어 수: ${players}`
} as const;

export const TOP = {
  CMD: "동접순위",
  DESC: "현재 동접순위를 확인한다냥!",
  SEARCH_URL: "https://store.steampowered.com/charts/mostplayed",
  GAMES_PER_PAGE: 10,
  FORMAT_INFO: "동접순위 (현재 / 최고)",
  GAME_TITLE: (idx: number, game: string) => `${idx}. ${strong(game)}`,
  GAME_STATISTICS: (current: string, peak: string) => `${EMOJI.MIDDLE_DOT} ${current}명 / ${peak}명`
} as const;
