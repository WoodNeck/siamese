import { Image, loadImage } from "canvas";

import { GamePlayer } from "../GamePlayer";

import PlayingCard from "./PlayingCard";
import PlayingCardDeck from "./PlayingCardDeck";

class OneCardPlayer extends GamePlayer {
  public avatar!: Image;
  public cards: PlayingCard[];
  public defeated: boolean;

  public constructor(player: GamePlayer) {
    super(player.user);

    this.interaction = player.interaction;
    this.index = player.index;

    this.cards = [];
    this.defeated = false;
  }

  public async fetchAvatar() {
    this.avatar = await loadImage(this.user.displayAvatarURL({ extension: "png", size: 32 }));
  }

  public defeat(deck: PlayingCardDeck) {
    this.defeated = true;

    deck.retrieve(...this.cards);
  }

  public canAddCards(count: number, max: number) {
    return count + this.cards.length < max;
  }

  public addCards(...cards: PlayingCard[]) {
    this.cards.push(...cards);
  }
}

export default OneCardPlayer;
