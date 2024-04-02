import { env } from "@siamese/env";

export const KAKAO_HEADER = {
  "Authorization": `KakaoAK ${env.KAKAO_REST_KEY}`
};

export const BOOK_SEARCH_URL = "https://dapi.kakao.com/v3/search/book?target=title";
export const BOOK_SEARCH_PARAMS = (query: string) => ({
  query
});
