import { env } from "@siamese/env";

export const NAVER_HEADER = {
  "X-Naver-Client-Id": env.NAVER_ID,
  "X-Naver-Client-Secret": env.NAVER_SECRET
};

export const API_URL = {
  KIN: "https://openapi.naver.com/v1/search/kin.json",
  SHOPPING: "https://openapi.naver.com/v1/search/shop.json"
};

export const PARAMS = {
  KIN: (query: string) => ({
    query,
    display: 50,
    sort: "sim"
  }),
  SHOPPING: (query: string) => ({
    query,
    display: 10
  })
};

export const SHOPPING_PRODUCT_TYPE: Record<number, string> = {
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
};
