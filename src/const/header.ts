/* eslint-disable @typescript-eslint/naming-convention */
import type Siamese from "~/Siamese";

export const NAVER_HEADER = (bot: Siamese) => ({
  "X-Naver-Client-Id": bot.env.NAVER_ID,
  "X-Naver-Client-Secret": bot.env.NAVER_SECRET
});

export const KAKAO_HEADER = (bot: Siamese) => ({
  "Authorization": `KakaoAK ${bot.env.KAKAO_REST_KEY}`
});
