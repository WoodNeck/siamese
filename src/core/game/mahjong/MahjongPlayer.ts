import Discord from "discord.js";

import MahjongHands from "./MahjongHands";

import { WIND } from "~/const/mahjong";

// eslint-disable-next-line @typescript-eslint/naming-convention
const DEFAULT_POINT = 25000;

class MahjongPlayer {
  public user: Discord.GuildMember;
  public interaction: Discord.MessageComponentInteraction;
  public point: number;
  public hands: MahjongHands;
  public wind: number;
  public playerIdx: number;
  public currentTurn: number;
  public riichiTurn: number;

  public get isRiichi() { return this.riichiTurn >= 0; }

  public constructor({ user, interaction }: {
    user: Discord.GuildMember;
    interaction: Discord.MessageComponentInteraction | null;
  }, idx: number) {
    this.user = user;
    this.interaction = interaction!;
    this.playerIdx = idx;
    this.hands = new MahjongHands(this);

    this.point = DEFAULT_POINT;
    this.wind = idx;
    this.riichiTurn = -1;
    this.currentTurn = -1;
  }

  public reset() {
    this.hands.reset();

    this.point = DEFAULT_POINT;
    this.wind = WIND.EAST;
    this.riichiTurn = -1;
    this.currentTurn = -1;
  }

  public isParent() { return this.wind === WIND.EAST; }
}

export default MahjongPlayer;
