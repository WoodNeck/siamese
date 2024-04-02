import type { ButtonInteraction, User } from "discord.js";

class GamePlayer {
  public user: User;
  public interaction: ButtonInteraction | null;
  public index: number;

  public constructor(user: User) {
    this.user = user;
    this.interaction = null;
    this.index = -1;
  }

  public setInteraction(interaction: ButtonInteraction | null) {
    this.interaction = interaction;
  }

  public setIndex(index: number) {
    this.index = index;
  }
}

export { GamePlayer };
