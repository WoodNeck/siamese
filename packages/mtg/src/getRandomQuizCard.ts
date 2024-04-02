import * as Scry from "scryfall-sdk";

import { QUIZ_QUERY_RES } from "./const";

export const getRandomQuizCard = async () => {
  let card: Scry.Card | null = null;

  while (!card) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    card = await (Scry.Cards as any).query("cards/random", { q: QUIZ_QUERY_RES }) as Scry.Card;
    const desc = card.printed_text ?? card.oracle_text;
    if (!desc) card = null;
  }

  return card;
};
