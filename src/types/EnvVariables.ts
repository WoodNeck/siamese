interface EnvVariables {
  // Essential
  BOT_TOKEN: string;
  BOT_DEFAULT_PREFIX: string;

  // Optional
  BOT_DEV_SERVER_INVITE?: string;
  BOT_DEV_USER_ID?: string;
  BOT_DEV_SERVER_ID?: string;
  BOT_LOG_INFO_CHANNEL?: string;
  BOT_LOG_ERROR_CHANNEL?: string;
  BOT_GITHUB_URL?: string;

  DBL_KEY?: string;

  GOOGLE_API_KEY?: string;
  GOOGLE_SEARCH_ENGINE_ID?: string;

  NAVER_ID?: string;
  NAVER_SECRET?: string;

  STEAM_API_KEY?: string;
}

export default EnvVariables;
