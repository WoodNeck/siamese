import axios, { type AxiosResponse } from "axios";

import BattlenetAuthorization from "./BattlenetAuthorization";
import { CARD_ENDPOINT, DEFAULT_PARAMS } from "./const";

import type { HearthstoneCard } from "./types";

export const searchHearthstoneCard = async (searchText: string) => {
  const token = await BattlenetAuthorization.getToken();

  const { data } = await axios.get(CARD_ENDPOINT, {
    params: {
      ...DEFAULT_PARAMS,
      textFilter: searchText,
      access_token: token
    }
  }) as AxiosResponse<{ cards: HearthstoneCard[]; cardCount: number; pageCount: number; page: number }>;
  const cards = data.cards.filter(card => card.cardTypeId !== 3);

  return cards;
};
