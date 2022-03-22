import * as EMOJI from "~/const/emoji";
import { CARD_SYMBOL, CARD_URL } from "~/const/command/minigame";
import { range, shuffle } from "~/util/helper";

export interface Card {
  id: number;
  index: number;
  name: string;
  emoji: string;
  url: string;
}

class PlayingCards {
  private _cards: number[];

  public get left() { return this._cards.length; }

  public constructor() {
    // 2 jokers included
    this._cards = shuffle(range(13 * 4 + 2));
  }

  public draw(count: number) {
    return this._cards.splice(0, count).map(card => this._parseCard(card));
  }

  public retrieve(...cards: number[]) {
    this._cards.push(...cards);
  }

  private _parseCard(card: number): Card {
    if (card < 13) {
      return {
        id: card,
        index: card,
        name: this._toSymbol(card),
        emoji: EMOJI.CARD.SPADE,
        url: `${CARD_URL.BASE}${CARD_URL.SPADE[card]}`
      };
    } else if (card < 26) {
      const relIdx = card - 13;

      return {
        id: card,
        index: relIdx,
        name: this._toSymbol(relIdx),
        emoji: EMOJI.CARD.HEART,
        url: `${CARD_URL.BASE}${CARD_URL.HEART[relIdx]}`
      };
    } else if (card < 39) {
      const relIdx = card - 26;

      return {
        id: card,
        index: relIdx,
        name: this._toSymbol(relIdx),
        emoji: EMOJI.CARD.CLUB,
        url: `${CARD_URL.BASE}${CARD_URL.CLUB[relIdx]}`
      };
    } else if (card < 52) {
      const relIdx = card - 39;

      return {
        id: card,
        index: relIdx,
        name: this._toSymbol(relIdx),
        emoji: EMOJI.CARD.DIAMOND,
        url: `${CARD_URL.BASE}${CARD_URL.DIAMOND[relIdx]}`
      };
    } else {
      return {
        id: card,
        index: -1,
        name: CARD_SYMBOL.JOKER,
        emoji: EMOJI.CARD.JOKER,
        url: `${CARD_URL.BASE}${CARD_URL.JOKER[Math.sign(card - 13 * 4)]}`
      };
    }
  }

  private _toSymbol(num: number) {
    if (CARD_SYMBOL[num]) return CARD_SYMBOL[num];
    else return `${num + 1}`;
  }
}

export default PlayingCards;
