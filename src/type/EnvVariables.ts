interface EnvVariables {
  // Bot - Essential
  BOT_TOKEN: string;
  BOT_DEFAULT_PREFIX: string;
  // Bot - optional
  BOT_DEV_SERVER_INVITE?: string;
  BOT_DEV_USER_ID?: string;
  BOT_DEV_SERVER_ID?: string;
  BOT_LOG_INFO_CHANNEL?: string;
  BOT_LOG_ERROR_CHANNEL?: string;
  BOT_GITHUB_URL?: string;
  // Discord Bot Lists
  DBL_KEY?: string;
  // GOOGLE
  GOOGLE_API_KEY?: string;
  GOOGLE_SEARCH_ENGINE_ID?: string;
  // NAVER
  NAVER_ID?: string;
  NAVER_SECRET?: string;
  // STEAM
  STEAM_API_KEY?: string;
  // AWS
  AWS_REGION?: string;
}

export default EnvVariables;