import axios, { type AxiosResponse } from "axios";
import { NodeHtmlMarkdown } from "node-html-markdown";

import { API_URL, NAVER_HEADER, PARAMS, SHOPPING_PRODUCT_TYPE } from "./const";

const searchShoppingItems = async (searchText: string) => {
  const { data } = await axios.get(API_URL.SHOPPING, {
    params: PARAMS.SHOPPING(searchText),
    headers: NAVER_HEADER
  }) as AxiosResponse<{
    total: number;
    items: Array<{
      title: string;
      total: number;
      lprice: string;
      hprice: string;
      productType: number;
      link: string;
      mallName: string;
      image: string;
    }>;
  }>;

  const nhm = new NodeHtmlMarkdown();

  return data.items.map(item => ({
    ...item,
    title: nhm.translate(item.title),
    type: SHOPPING_PRODUCT_TYPE[item.productType]
  }));
};

export {
  searchShoppingItems
};
