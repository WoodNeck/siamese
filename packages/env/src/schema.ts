import { z } from "zod";

const schema = {
  // BOT
  BOT_TOKEN: z.string(),
  BOT_DEFAULT_PREFIX: z.string(),
  BOT_ICON_PREFIX: z.string(),
  BOT_HELP_CMD: z.string(),
  // API 서버
  BOT_CLIENT_ID: z.string(),
  BOT_CLIENT_SECRET: z.string(),
  SERVER_DOMAIN: z.string(),
  WEB_URL_BASE: z.string(),
  SESSION_SECRET: z.string(),
  ICON_CHANNEL_ID: z.string(),
  HTTPS_CERT: z.string(),
  HTTPS_KEY: z.string(),
  // MISCELLANEOUS
  BOT_DEV_SERVER_INVITE: z.string(),
  BOT_DEV_USER_ID: z.string(),
  BOT_DEV_SERVER_ID: z.string(),
  BOT_LOG_INFO_CHANNEL: z.string(),
  BOT_LOG_ERROR_CHANNEL: z.string(),
  BOT_GITHUB_URL: z.string(),
  // API-NAVER
  NAVER_ID: z.string(),
  NAVER_SECRET: z.string(),
  // API-KAKAO
  KAKAO_REST_KEY: z.string(),
  // API-STEAM
  STEAM_API_KEY: z.string(),
  // API-Coin Market Cap (https://coinmarketcap.com/api/)
  COIN_API_KEY: z.string(),
  // API-Battle.net
  BLIZZARD_ID: z.string(),
  BLIZZARD_SECRET: z.string(),
  // API-Eternal Return
  ER_API_KEY: z.string(),
  // 카드 이미지 에셋 경로
  PLAYING_CARDS_DIR: z.string()
} as const;

export default schema;
