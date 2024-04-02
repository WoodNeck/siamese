import { StringUsage, type CommandOptions } from "@siamese/core";
import { EMOJI } from "@siamese/emoji";
import { strong, strike, link } from "@siamese/markdown";
import { stripIndents } from "common-tags";
import Josa from "josa-js";

import { CATEGORY } from "../../const/category";

export const IMAGE = {
  CMD: "이미지",
  DESC: "구글 이미지를 검색한다냥!",
  CATEGORY: CATEGORY.SEARCH,
  USAGE: [
    new StringUsage({
      name: "검색어",
      description: "검색할 이미지 키워드를 달라냥!"
    })
  ],
  EMPTY_CONTENT: "검색할 내용을 달라냥!",
  EMPTY_RESULT: "해당 검색어로 이미지를 하나도 찾을 수 없었다냥!"
} satisfies CommandOptions;

export const YOUTUBE = {
  CMD: "유튜브",
  DESC: "유튜브 동영상을 검색한다냥!",
  CATEGORY: CATEGORY.SEARCH,
  USAGE: [
    new StringUsage({
      name: "검색어",
      description: "검색할 동영상의 키워드를 달라냥!"
    })
  ],
  MAX_RESULTS: 10,
  VIDEO_URL: (videoId: string) => `https://youtu.be/${videoId}`,
  EMPTY_CONTENT: "검색할 내용을 달라냥!",
  EMPTY_RESULT: "해당 검색어로 동영상을 하나도 찾을 수 없었다냥!"
} satisfies CommandOptions;

export const KIN = {
  CMD: "지식인",
  DESC: "네이버 지식인을 검색한다냥!",
  CATEGORY: CATEGORY.SEARCH,
  USAGE: [
    new StringUsage({
      name: "검색어",
      description: "검색할 키워드를 달라냥!"
    })
  ],
  SERVICE_NAME: "네이버 지식인",
  ICON: "https://www.naver.com/favicon.ico?1",
  ITEMS_PER_PAGE: 5,
  EMPTY_CONTENT: "검색할 내용을 달라냥!",
  EMPTY_RESULT: "해당 검색어로 지식인 결과를 하나도 찾을 수 없었다냥!"
} satisfies CommandOptions;

export const CHEAPEST = {
  CMD: "최저가",
  DESC: "게임 최저가를 cheapshark.com에서 검색한다냥!",
  CATEGORY: CATEGORY.SEARCH,
  USAGE: [
    new StringUsage({
      name: "게임",
      description: "검색할 게임 이름을 달라냥!"
    })
  ],
  SEARCH_URL: "https://www.cheapshark.com/api/1.0/deals",
  SEARCH_PARAMS: (query: string) => ({
    title: query,
    sortBy: "Savings",
    pageSize: "10",
    pageNumber: "0"
  }),
  REDIRECT_URL: (id: string) => `https://www.cheapshark.com/redirect.php?dealID=${id}`,
  GAME_SALE_DESC: (price: string, originalPrice: string, savings: number, metaScore: number, metaLink: string) => stripIndents`
    ${EMOJI.DOLLAR} ${strong(`${price}$`)} / ${strike(originalPrice)}$ (${savings}% 할인)
    ${metaScore ? `Metascore: ${link(metaScore.toString(), `https://www.metacritic.com${metaLink}`)}` : ""}`,
  GAME_NO_SALE_DESC: (originalPrice: string) => stripIndents`
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
  } as Record<string, string>,
  REVIEW_FOOTER: (text: string, percent: string, count: string) => `${text} - 전체 사용자 평가 ${count}건 중 ${percent}%가 긍정적이다냥!`,
  REVIEW_ICON: (percent: number) => percent
    ? (percent >= 70) ? "https://www.cheapshark.com/img/reviews/positive.png"
      : (percent >= 40) ? "https://www.cheapshark.com/img/reviews/mixed.png"
        : "https://www.cheapshark.com/img/reviews/negative.png"
    : "",
  EMPTY_CONTENT: "검색할 내용을 달라냥!",
  EMPTY_RESULT: "해당 검색어로 게임을 하나도 찾을 수 없었다냥!"
} satisfies CommandOptions;

export const SHOPPING = {
  CMD: "쇼핑",
  DESC: "네이버 쇼핑에 상품을 검색한다냥!",
  CATEGORY: CATEGORY.SEARCH,
  USAGE: [
    new StringUsage({
      name: "상품",
      description: "검색할 상품명을 달라냥!"
    })
  ],
  ICON: "https://www.naver.com/favicon.ico?1",
  PRICE: (low: string, high?: string) => stripIndents`
    ${high ? `${EMOJI.MIDDLE_DOT} 최저 ${low}원 ~ ${high}원` : `${EMOJI.MIDDLE_DOT} ${low}원`}`,
  EMPTY_CONTENT: "검색할 내용을 달라냥!",
  EMPTY_RESULT: "해당 검색어로 상품을 하나도 찾을 수 없었다냥!"
} satisfies CommandOptions;

export const STOCK = {
  CMD: "주식",
  DESC: "주식/증권 정보를 검색한다냥!",
  CATEGORY: CATEGORY.SEARCH,
  USAGE: [
    new StringUsage({
      name: "종목",
      description: "검색할 주식/증권 항목을 달라냥!",
      autocomplete: true
    })
  ],
  ALIASES: ["증권"],
  URL: (query: string) => `https://m.stock.naver.com/front-api/v1/search/autoComplete?query=${encodeURIComponent(query)}&target=stock`,
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
  } as Record<string, string>,
  CURRENCY: (num: number) => `${num}원`,
  DOME_IMAGE: (id: string, time: string) => `https://ssl.pstatic.net/imgfinance/chart/mobile/${time}/${id}_end.png`,
  WORLD_IMAGE: (id: string, time: string, isStock: boolean) => `https://ssl.pstatic.net/imgfinance/chart/mobile/world${isStock ? "/item" : ""}/${time}/${id}_end.png`,
  DOME_THUMB: (id: string) => `https://ssl.pstatic.net/imgfinance/chart/mobile/mini/${id}_end_up_tablet.png`,
  WORLD_THUMB: (id: string, isStock: boolean) => `https://ssl.pstatic.net/imgfinance/chart/mobile/world${isStock ? "/item" : ""}/day/${id}_end_up_tablet.png`,
  EMPTY_CONTENT: "검색할 주식/증권 이름을 달라냥!",
  EMPTY_RESULT: "해당 검색어로 주식/증권 정보를 하나도 찾을 수 없었다냥!"
} satisfies CommandOptions;

export const COIN = {
  CMD: "코인",
  DESC: "가상화폐 정보를 검색한다냥!",
  CATEGORY: CATEGORY.SEARCH,
  USAGE: [
    new StringUsage({
      name: "코인",
      description: "검색할 코인 이름을 달라냥!",
      autocomplete: true
    })
  ],
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
  },
  EMPTY_CONTENT: "검색할 코인 이름을 달라냥!",
  EMPTY_RESULT: "해당 검색어로 코인을 하나도 찾을 수 없었다냥!"
} satisfies CommandOptions;

export const EXCHANGE = {
  CMD: "환율",
  DESC: "환율 정보를 검색한다냥!",
  CATEGORY: CATEGORY.SEARCH,
  USAGE: [
    new StringUsage({
      name: "금액",
      description: "변환할 금액을 금액 + 화폐 단위로 알려달라냥! (예: 100달러)"
    })
  ],
  CACHE_KEY: "exchange_cache_key",
  API_URL: "https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD,FRX.KRWJPY,FRX.KRWCNY,FRX.KRWEUR,FRX.KRWGBP,FRX.KRWCHF,FRX.KRWCAD,FRX.KRWNZD,FRX.KRWHKD,FRX.KRWBRL,FRX.KRWMXN,FRX.KRWAED,FRX.KRWKWD,FRX.KRWBHD,FRX.KRWINR,FRX.KRWSAR,FRX.KRWNOK,FRX.KRWDKK,FRX.KRWMYR,FRX.KRWBDT,FRX.KRWPKR,FRX.KRWIDR,FRX.KRWTWD,FRX.KRWPHP,FRX.KRWSEK,FRX.KRWAUD,FRX.KRWSGD,FRX.KRWTHB,FRX.KRWEGP,FRX.KRWBND,FRX.KRWILS,FRX.KRWJOD,FRX.KRWVND,FRX.KRWRUB,FRX.KRWHUF,FRX.KRWPLN,FRX.KRWZAR,FRX.KRWMNT,FRX.KRWCZK,FRX.KRWKZT,FRX.KRWQAR,FRX.KRWTRY",
  DEFAULT_UNIT: "원",
  CHANGE: {
    RISE: "RISE",
    FALL: "FALL"
  },
  ERROR: {
    EMPTY_CONTENT: "변환할 금액을 달라냥! (예: 100달러)",
    WRONG_FORM: "잘못된 형식이다냥! 금액 + 화폐 단위를 달라냥! (예: 100달러)",
    WRONG_UNIT: (unit: string) => `${Josa.r(unit, "은/는")} 모르는 단위다냥!`
  }
} satisfies CommandOptions;

export const BOOK = {
  CMD: "책",
  DESC: "도서를 검색한다냥!",
  CATEGORY: CATEGORY.SEARCH,
  USAGE: [
    new StringUsage({
      name: "책",
      description: "검색할 책 이름을 달라냥!"
    })
  ],
  ITEMS_PER_PAGE: 5,
  INFO_TITLE: "책 소개",
  AUTHOR: "저자",
  TRANSLATOR: "역자",
  DATETIME: "출판일",
  PUBLISHER: "출판사",
  PRICE: "정가",
  SALE_PRICE: "판매가",
  PRICE_UNIT: "원",
  EMPTY_CONTENT: "검색할 책 이름을 달라냥!",
  EMPTY_RESULT: "해당 검색어로 책을 한 권도 찾을 수 없었다냥!"
} satisfies CommandOptions;
