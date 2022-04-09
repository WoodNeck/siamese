import Discord from "discord.js";
import { Image, loadImage } from "canvas";

import PlayingCard from "../PlayingCard";
import PlayingCardDeck from "../PlayingCardDeck";

class OneCardPlayer {
  public interaction: Discord.MessageComponentInteraction;

  private _user: Discord.GuildMember;
  private _avatar: Image;
  private _cards: PlayingCard[];
  private _defeated: boolean;
  private _playerIndex: number;

  public get user() { return this._user; }
  public get avatar() { return this._avatar; }
  public get cards() { return this._cards; }
  public get defeated() { return this._defeated; }
  public get playerIndex() { return this._playerIndex; }

  public constructor({ user, interaction, index }: {
    user: Discord.GuildMember;
    interaction: Discord.MessageComponentInteraction | null;
    index: number;
  }) {
    this._user = user;
    this.interaction = interaction!;
    this._playerIndex = index;
    this._cards = [];
    this._defeated = false;
  }

  public async fetchAvatar() {
    this._avatar = await loadImage(this._user.displayAvatarURL({ format: "png" }));
  }

  public defeat(deck: PlayingCardDeck) {
    this._defeated = true;

    deck.retrieve(...this._cards);
  }

  public canAddCards(count: number, max: number) {
    return count + this._cards.length < max;
  }

  public addCards(...cards: PlayingCard[]) {
    this._cards.push(...cards);
  }
}

export default OneCardPlayer;
