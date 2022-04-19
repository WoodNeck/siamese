interface EnvVariables {
  // Bot - Essential
  BOT_TOKEN: string;
  BOT_DEFAULT_PREFIX: string;
  BOT_ICON_PREFIX: string;
  BOT_ENV: "development" | "production";
  // Rest API Sever - Essential
  BOT_CLIENT_ID: string;
  BOT_CLIENT_SECRET: string;
  SERVER_DOMAIN: string;
  WEB_URL_BASE: string;
  SESSION_SECRET: string;
  ICON_CHANNEL_ID: string;
  HTTPS_CERT?: string;
  HTTPS_KEY?: string;
  // Bot - optional
  BOT_DEV_SERVER_INVITE?: string;
  BOT_DEV_USER_ID?: string;
  BOT_DEV_SERVER_ID?: string;
  BOT_LOG_INFO_CHANNEL?: string;
  BOT_LOG_ERROR_CHANNEL?: string;
  BOT_GITHUB_URL?: string;
  // GOOGLE
  GOOGLE_API_KEY?: string;
  GOOGLE_SEARCH_ENGINE_ID?: string;
  // NAVER
  NAVER_ID?: string;
  NAVER_SECRET?: string;
  // STEAM
  STEAM_API_KEY?: string;
  // COIN
  COIN_API_KEY?: string;
  // BATTLE.NET
  BLIZZARD_ID?: string;
  BLIZZARD_SECRET?: string;
  // CARDS
  PLAYING_CARDS_DIR?: string;
}

export default EnvVariables;
