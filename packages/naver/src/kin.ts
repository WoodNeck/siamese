import axios, { type AxiosResponse } from "axios";
import { decode } from "html-entities";

import { API_URL, NAVER_HEADER, PARAMS } from "./const";

const searchNaverKin = async (searchText: string) => {
  const { data } = await axios.get(API_URL.KIN, {
    params: PARAMS.KIN(searchText),
    headers: NAVER_HEADER
  }) as AxiosResponse<{
    total: number;
    items: Array<{
      title: string;
      description: string;
      link: string;
    }>;
  }>;

  return data.items.map(item => ({
    ...item,
    title: decode(item.title),
    description: decode(item.description)
  }));
};

export {
  searchNaverKin
};
