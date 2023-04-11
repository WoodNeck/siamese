/* eslint-disable @typescript-eslint/naming-convention */
import Josa from "josa-js";

import { dedent } from "~/util/helper";
import { strong, strike, link } from "~/util/markdown";
import * as EMOJI from "~/const/emoji";

export const IMAGE = {
  CMD: "이미지",
  DESC: "구글 이미지를 검색한다냥!",
  USAGE: "검색어",
  TARGET: "이미지",
  DESC_OPTION: "검색할 이미지 키워드를 달라냥!",
  SEARCH_URL: "https://www.google.com/search",
  SEARCH_PARAMS: (query, isSafeSearch) =>
    // nfpr: disable auto query correction(ex: museuk -> museum)
    // safe: enable safe searching
    isSafeSearch
      ? {
        q: query,
        tbm: "isch",
        nfpr: "1",
        safe: "active"
      }
      : {
        q: query,
        tbm: "isch",
        nfpr: "1",
        pws: "0",
        gl: "us",
        gws_rd: "cr"
      },
  FAKE_HEADER: {
    "user-agent": "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36 Edg/91.0.864.64"
  }
} as const;

export const YOUTUBE = {
  CMD: "유튜브",
  DESC: "유튜브 동영상을 검색한다냥!",
  USAGE: "검색어",
  TARGET: "동영상",
  DESC_OPTION: "검색할 동영상의 키워드를 달라냥!",
  MAX_RESULTS: 10,
  VIDEO_URL: (videoId: string) => `https://youtu.be/${videoId}`
} as const;

export const KIN = {
  CMD: "지식인",
  DESC: "네이버 지식인을 검색한다냥!",
  USAGE: "검색어",
  TARGET: "지식인 항목",
  DESC_OPTION: "검색할 키워드를 달라냥!",
  SERVICE_NAME: "네이버 지식인",
  ICON: "https://www.naver.com/favicon.ico?1",
  ITEMS_PER_PAGE: 5,
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
  DESC_OPTION: "검색할 게임 이름을 달라냥!",
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
    ? "#66cc33"
    : score >= 50
      ? "#ffcc33"
      : "#ff0000",
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
  DESC_OPTION: "검색할 상품명을 달라냥!",
  ICON: "https://www.naver.com/favicon.ico?1",
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
  USAGE_OPTION: "검색어",
  DESC_OPTION: "검색할 키워드를 달라냥!",
  URL: "https://www.google.com/search",
  PARAMS: (query: string) => ({
    q: query
  })
} as const;

export const STOCK = {
  CMD: "주식",
  DESC: "주식/증권 정보를 검색한다냥!",
  USAGE: "종목명",
  TARGET: "검색 결과",
  ALIAS: ["증권"],
  DESC_OPTION: "검색할 주식/증권 항목을 달라냥!",
  URL: (query: string) => `https://ac.finance.naver.com/ac?q=${encodeURIComponent(query)}&q_enc=euc-kr&t_koreng=1&st=111&r_lt=111`,
  DOME_STOCK_HEADER_URL: (id: string) => `https://m.stock.naver.com/api/item/getOverallHeaderItem.nhn?code=${id}`,
  DOME_STOCK_INFO_URL: (id: string) => `https://m.stock.naver.com/api/html/item/getOverallInfo.nhn?code=${id}`,
  DOME_BASIC_URL: (id: string) => `https://m.stock.naver.com/api/stock/${id}/basic`,
  DOME_SISE_URL: (id: string) => `https://m.stock.naver.com/sise/siseIndex.nhn?code=${id}`,
  WORLD_BASIC_URL: (id: string) => `https://api.stock.naver.com/stock/${id}/basic`,
  WORLD_SISE_URL: (id: string) => `https://api.stock.naver.com/index/${id}/basic`,
  TIMES: {
    "일봉": "candle/day",
    "주봉": "candle/week",
    "월봉": "candle/month",
    "1일": "day",
    "3개월": "area/month3",
    "1년": "area/year",
    "3년": "area/year3",
    "10년": "area/year10"
  },
  CURRENCY: (num: number) => `${num}원`,
  DOME_IMAGE: (id: string, time: string) => `https://ssl.pstatic.net/imgfinance/chart/mobile/${time}/${id}_end.png`,
  WORLD_IMAGE: (id: string, time: string, isStock: boolean) => `https://ssl.pstatic.net/imgfinance/chart/mobile/world${isStock ? "/item" : ""}/${time}/${id}_end.png`,
  DOME_THUMB: (id: string) => `https://ssl.pstatic.net/imgfinance/chart/mobile/mini/${id}_end_up_tablet.png`,
  WORLD_THUMB: (id: string, isStock: boolean) => `https://ssl.pstatic.net/imgfinance/chart/mobile/world${isStock ? "/item" : ""}/day/${id}_end_up_tablet.png`
} as const;

export const COIN = {
  CMD: "코인",
  DESC: "가상화폐 정보를 검색한다냥!",
  USAGE: "코인명",
  TARGET: "코인",
  DESC_OPTION: "검색할 코인명을 달라냥!",
  MARKET_KEY: "market",
  MARKET_URL: "https://api.upbit.com/v1/market/all?isDetails=true",
  TICKER_URL: "https://api.upbit.com/v1/ticker",
  CHART_ID_URL: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/map",
  CHART_IMAGE_URL: (id: number) => `https://s3.coinmarketcap.com/generated/sparklines/web/7d/usd/${id}.png`,
  COIN_IMAGE_URL: (id: number) => `https://s2.coinmarketcap.com/static/img/coins/64x64/${id}.png`,
  NAME: {
    HIGH_PRICE: "고가",
    LOW_PRICE: "저가",
    TRADE_VOLUME_24H: "거래량(24H)",
    TRADE_PRICE_24H: "거래대금(24H)",
    HIGHEST_52_WEEK_PRICE: "52주 신고가",
    LOWEST_52_WEEK_PRICE: "52주 신저가"
  }
};

export const EXCHANGE = {
  CMD: "환율",
  DESC: "환율 정보를 검색한다냥!",
  USAGE: "금액 + 화폐 단위 (예: 100달러)",
  DESC_OPTION: "변환할 금액을 금액 + 화폐 단위로 알려달라냥! (예: 100달러)",
  USAGE_OPTION: "금액",
  CACHE_KEY: "exchange_cache_key",
  API_URL: "https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD,FRX.KRWJPY,FRX.KRWCNY,FRX.KRWEUR,FRX.KRWGBP,FRX.KRWCHF,FRX.KRWCAD,FRX.KRWNZD,FRX.KRWHKD,FRX.KRWBRL,FRX.KRWMXN,FRX.KRWAED,FRX.KRWKWD,FRX.KRWBHD,FRX.KRWINR,FRX.KRWSAR,FRX.KRWNOK,FRX.KRWDKK,FRX.KRWMYR,FRX.KRWBDT,FRX.KRWPKR,FRX.KRWIDR,FRX.KRWTWD,FRX.KRWPHP,FRX.KRWSEK,FRX.KRWAUD,FRX.KRWSGD,FRX.KRWTHB,FRX.KRWEGP,FRX.KRWBND,FRX.KRWILS,FRX.KRWJOD,FRX.KRWVND,FRX.KRWRUB,FRX.KRWHUF,FRX.KRWPLN,FRX.KRWZAR,FRX.KRWMNT,FRX.KRWCZK,FRX.KRWKZT,FRX.KRWQAR,FRX.KRWTRY",
  DEFAULT_UNIT: "원",
  CHANGE: {
    RISE: "RISE",
    FALL: "FALL"
  },
  ERROR: {
    WRONG_FORM: "잘못된 형식이다냥! 금액 + 화폐 단위를 달라냥! (예: 100달러)",
    WRONG_UNIT: (unit: string) => `${Josa.r(unit, "은/는")} 모르는 단위다냥!`
  }
};

export const BOOK = {
  CMD: "책",
  DESC: "도서를 검색한다냥!",
  USAGE: "이름",
  TARGET: "책",
  DESC_SLASH: "검색할 책 이름을 달라냥!",
  ITEMS_PER_PAGE: 5,
  SEARCH_URL: "https://dapi.kakao.com/v3/search/book?target=title",
  SEARCH_PARAMS: (query: string) => ({
    query
  }),
  INFO_TITLE: "책 소개",
  AUTHOR: "저자",
  TRANSLATOR: "역자",
  DATETIME: "출판일",
  PUBLISHER: "출판사",
  PRICE: "정가",
  SALE_PRICE: "판매가",
  PRICE_UNIT: "원"
} as const;
