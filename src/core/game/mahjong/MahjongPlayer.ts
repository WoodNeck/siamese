import Discord from "discord.js";

import MahjongHands from "./MahjongHands";
import MahjongGame from "./MahjongGame";

import { WIND } from "~/const/mahjong";

// eslint-disable-next-line @typescript-eslint/naming-convention
const DEFAULT_POINT = 25000;

class MahjongPlayer {
  public interaction: Discord.MessageComponentInteraction;

  private _user: Discord.GuildMember;
  private _point: number;
  private _hands: MahjongHands;
  private _baseWind: number;
  private _playerIdx: number;
  private _riichiFlag: boolean;
  private _currentTurn: number;
  private _riichiTurn: number;

  public get user() { return this._user; }
  public get hands() { return this._hands; }
  public get isRiichi() { return this._riichiTurn >= 0; }
  public get point() { return this._point; }
  public get playerIdx() { return this._playerIdx; }
  public get riichiFlag() { return this._riichiFlag; }
  public get riichiTurn() { return this._riichiTurn; }
  public get currentTurn() { return this._currentTurn; }

  public constructor({ user, interaction }: {
    user: Discord.GuildMember;
    interaction: Discord.MessageComponentInteraction | null;
  }, game: MahjongGame, idx: number) {
    this._user = user;
    this.interaction = interaction!;
    this._playerIdx = idx;
    this._hands = new MahjongHands(this, game);

    this._point = DEFAULT_POINT;
    this._baseWind = idx;
    this._riichiFlag = false;
    this._riichiTurn = -1;
    this._currentTurn = -1;
  }

  public getWind(roundWind: number) {
    return (this._baseWind + roundWind) % 4;
  }

  public reset() {
    this._hands.reset();

    this._riichiFlag = false;
    this._riichiTurn = -1;
    this._currentTurn = -1;
  }

  public onTurnStart() {
    this._currentTurn += 1;
    this._riichiFlag = false;
  }

  public doRiichi() {
    this._riichiTurn = this._currentTurn;
  }

  public toggleRiichiFlag() {
    this._riichiFlag = !this._riichiFlag;
  }

  public setPoint(newPoint: number) {
    this._point = newPoint;
  }

  public isParent(roundWind: number) {
    return this.getWind(roundWind) === WIND.EAST;
  }
}

export default MahjongPlayer;
