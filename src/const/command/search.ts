/* eslint-disable @typescript-eslint/naming-convention */
import { dedent } from "~/util/helper";
import { strong, strike, link } from "~/util/markdown";
import * as EMOJI from "~/const/emoji";
import EnvVariables from "~/type/EnvVariables";

export const IMAGE = {
  CMD: "이미지",
  DESC: "구글 이미지를 검색한다냥!",
  USAGE: "검색어",
  TARGET: "이미지",
  MENU_TIME: 30,
  SEARCH_URL: "https://www.googleapis.com/customsearch/v1",
  SEARCH_PARAMS: (env: EnvVariables, query: string, isSafeSearch: boolean) => {
    const params = {
      q: query,
      key: env.GOOGLE_API_KEY,
      cx: env.GOOGLE_SEARCH_ENGINE_ID,
      searchType: "image"
    };

    return Object.assign(params, isSafeSearch ? { safe: "active" } : { safe: "off" });
  }
} as const;

export const YOUTUBE = {
  CMD: "유튜브",
  DESC: "유튜브 동영상을 검색한다냥!",
  USAGE: "검색어",
  TARGET: "동영상",
  MENU_TIME: 30,
  MAX_RESULTS: 10,
  VIDEO_URL: (videoId: string) => `https://youtu.be/${videoId}`
} as const;

export const KIN = {
  CMD: "지식인",
  DESC: "네이버 지식인을 검색한다냥!",
  USAGE: "검색어",
  TARGET: "지식인 항목",
  SERVICE_NAME: "네이버 지식인",
  ICON: "https://www.naver.com/favicon.ico?1",
  ITEMS_PER_PAGE: 5,
  MENU_TIME: 30,
  SEARCH_URL: "https://openapi.naver.com/v1/search/kin.json",
  SEARCH_PARAMS: (query: string) => ({
    query,
    display: 50,
    sort: "sim"
  })
} as const;

export const CHEAPEST = {
  CMD: "최저가",
  DESC: "게임 최저가를 cheapshark.com에서 검색한다냥!",
  USAGE: "게임명",
  TARGET: "게임",
  MENU_TIME: 30,
  SEARCH_URL: "https://www.cheapshark.com/api/1.0/deals",
  SEARCH_PARAMS: (query: string) => ({
    title: query,
    sortBy: "Savings",
    pageSize: 10,
    pageNumber: 0
  }),
  REDIRECT_URL: (id: string) => `https://www.cheapshark.com/redirect.php?dealID=${id}`,
  GAME_SALE_DESC: (price: string, originalPrice: string, savings: number, metaScore: number, metaLink: string) => dedent`
    ${EMOJI.DOLLAR} ${strong(`${price}$`)} / ${strike(originalPrice)}$ (${savings}% 할인)
    ${metaScore ? `Metascore: ${link(metaScore.toString(), `https://www.metacritic.com${metaLink}`)}` : ""}`,
  GAME_NO_SALE_DESC: (originalPrice: string) => dedent`
    ${EMOJI.DOLLAR} ${strong(`${originalPrice}$`)}`,
  METASCORE_IMG: "https://www.metacritic.com/images/icons/metacritic-icon.svg",
  METASCORE_COLOR: (score: number) => score >= 75
    ? "66cc33"
    : score >= 50
      ? "ffcc33"
      : "ff0000",
  REVIEW_TEXT: {
    "Overwhelmingly Positive": "압도적으로 긍정적",
    "Very Positive": "매우 긍정적",
    "Positive": "긍정적",
    "Mostly Positive": "대체로 긍정적",
    "Mixed": "복합적",
    "Mostly Negative": "대체로 부정적",
    "Negative": "부정적",
    "Very Negative": "매우 부정적",
    "Overwhelmingly Negative": "압도적으로 부정적"
  },
  REVIEW_FOOTER: (text: string, percent: string, count: string) => `${text} - 전체 사용자 평가 ${count}건 중 ${percent}%가 긍정적이다냥!`,
  REVIEW_ICON: (percent: number) => percent
    ? (percent >= 70) ? "https://www.cheapshark.com/img/reviews/positive.png"
      : (percent >= 40) ? "https://www.cheapshark.com/img/reviews/mixed.png"
        : "https://www.cheapshark.com/img/reviews/negative.png"
    : ""
} as const;

export const SHOPPING = {
  CMD: "쇼핑",
  DESC: "네이버 쇼핑에 상품을 검색한다냥!",
  USAGE: "상품명",
  TARGET: "상품",
  ICON: "https://www.naver.com/favicon.ico?1",
  MENU_TIME: 30,
  SEARCH_URL: "https://openapi.naver.com/v1/search/shop.json",
  SEARCH_PARAMS: (query: string) => ({
    query,
    display: 10
  }),
  PRICE: (low: number, high: number) => dedent`
    ${high ? `${EMOJI.MIDDLE_DOT} 최저 ${low}원 ~ ${high}원` : `${EMOJI.MIDDLE_DOT} ${low}원`}`,
  PRODUCT_TYPE: {
    1: "일반상품",
    2: "일반상품",
    3: "일반상품",
    4: "중고상품",
    5: "중고상품",
    6: "중고상품",
    7: "단종상품",
    8: "단종상품",
    9: "단종상품",
    10: "판매예정상품",
    11: "판매예정상품",
    12: "판매예정상품"
  }
} as const;

export const SEARCH = {
  CMD: "검색",
  DESC: "구글에서 문서를 검색한다냥!",
  USAGE: "검색할 내용",
  TARGET: "검색 결과",
  MENU_TIME: 30,
  URL: "https://www.google.com/search",
  PARAMS: (query: string) => ({
    q: query
  })
} as const;
