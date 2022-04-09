import PlayingCard, { CardSymbol } from "./PlayingCard";

import { range, shuffle } from "~/util/helper";

class PlayingCardDeck {
  private _cards: PlayingCard[];

  public get cards() { return this._cards; }
  public get left() { return this._cards.length; }

  public constructor() {
    const spades = range(13).map(idx => new PlayingCard(CardSymbol.SPADE, idx));
    const hearts = range(13).map(idx => new PlayingCard(CardSymbol.HEART, idx));
    const diamonds = range(13).map(idx => new PlayingCard(CardSymbol.DIAMOND, idx));
    const clubs = range(13).map(idx => new PlayingCard(CardSymbol.CLUB, idx));
    const jokers = range(2).map(idx => new PlayingCard(CardSymbol.JOKER, idx));

    this._cards = [
      ...spades,
      ...hearts,
      ...diamonds,
      ...clubs,
      ...jokers
    ];

    this.shuffle();
  }

  public draw(count: number) {
    return this._cards.splice(0, count);
  }

  public shuffle() {
    this._cards = shuffle(this._cards);
  }

  public retrieve(...cards: PlayingCard[]) {
    this._cards.push(...cards);
  }
}

export default PlayingCardDeck;
