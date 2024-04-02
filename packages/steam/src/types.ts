export interface SteamUser {
  personaname: string;
  profileurl: string;
  avatarmedium: string;
  personastate: number;
  lastlogoff: number;
  timecreated: number;
  gameextrainfo?: string;
  loccountrycode?: string;
}

export interface SteamBanInfo {
  CommunityBanned: boolean;
  VACBanned: boolean;
  NumberOfGameBans: number;
  EconomyBan: string;
}

export interface SteamGame {
  name: string;
  appid: string;
  img_icon_url: string;
  img_logo_url: string;
  playtime_forever: number;
  playtime_2weeks: number;
}
