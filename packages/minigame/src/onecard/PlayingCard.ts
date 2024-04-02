/* eslint-disable @typescript-eslint/naming-convention */
export enum CardSymbol {
  SPADE,
  HEART,
  DIAMOND,
  CLUB,
  JOKER
}

export const CARD_EMOJI = {
  [CardSymbol.SPADE]: "<:pixel_spade:961988790195482644>",
  [CardSymbol.CLUB]: "<:pixel_club:961988790178676797>",
  [CardSymbol.HEART]: "<:pixel_heart:961988790178701413>",
  [CardSymbol.DIAMOND]: "<:pixel_diamond:961988790321287238>",
  [CardSymbol.JOKER]: "<:pixel_joker:961990276879101972>"
};

const CARD_NAME = {
  [0]: "A",
  [10]: "J",
  [11]: "Q",
  [12]: "K",
  JOKER: "JOKER"
} as Record<number | string, string>;

class PlayingCard {
  private _symbol: CardSymbol;
  // Index within a type(symbol like spade, heart, club), from 0 to 13
  private _index: number;

  // Unique ID
  public get id() { return this._symbol * 13 + this._index; }
  public get symbol() { return this._symbol; }
  public get index() { return this._index; }

  public constructor(symbol: CardSymbol, index: number) {
    this._symbol = symbol;
    this._index = index;
  }

  public getName(): string {
    if (this._symbol === CardSymbol.JOKER) return "JOKER";

    const index = this._index;

    if (CARD_NAME[index]) return CARD_NAME[index];
    else return `${index + 1}`;
  }

  public getEmoji(): string {
    return CARD_EMOJI[this._symbol];
  }

  public canAnimate(): boolean {
    if (this._symbol === CardSymbol.JOKER) return true;
    if (this._index === 0) return true; // Ace
    if (this._index >= 10) return true; // JQK
    return false;
  }
}

export default PlayingCard;
