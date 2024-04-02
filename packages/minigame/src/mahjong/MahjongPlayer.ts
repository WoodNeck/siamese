import Discord from "discord.js";

import MahjongHands from "./MahjongHands";
import MahjongGame from "./MahjongGame";

import { ACTION_TYPE, WIND } from "~/const/mahjong";
import { MAX_INTERACTION_DURATION } from "~/const/discord";

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
  private _lastGameTurn: number;
  private _lastAction: ACTION_TYPE;

  public get user() { return this._user; }
  public get hands() { return this._hands; }
  public get isRiichi() { return this._riichiTurn >= 0; }
  public get point() { return this._point; }
  public get playerIdx() { return this._playerIdx; }
  public get riichiFlag() { return this._riichiFlag; }
  public get riichiTurn() { return this._riichiTurn; }
  public get currentTurn() { return this._currentTurn; }
  public get lastGameTurn() { return this._lastGameTurn; }
  public get lastAction() { return this._lastAction; }

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
    this._lastAction = ACTION_TYPE.DISCARD;
  }

  public getWind(roundWind: number) {
    return (this._baseWind + roundWind) % 4;
  }

  public reset() {
    this._hands.reset();

    this._riichiFlag = false;
    this._riichiTurn = -1;
    this._currentTurn = -1;
    this._lastAction = ACTION_TYPE.DISCARD;
  }

  public onTurnStart(turn: number) {
    this._currentTurn = turn;
    this._riichiFlag = false;
  }

  public onTurnEnd() {
    this._lastGameTurn = this._currentTurn;
  }

  public doRiichi() {
    this._riichiTurn = this._currentTurn;
  }

  public setAction(action: ACTION_TYPE) {
    this._lastAction = action;
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

  public shouldReconnect(): boolean {
    return Date.now() - this.interaction.createdTimestamp >= MAX_INTERACTION_DURATION;
  }

  public getIndexDiff(other: MahjongPlayer) {
    const playerIndex = this._playerIdx;
    const upperIndex = playerIndex < other.playerIdx ? playerIndex + 4 : playerIndex;

    return upperIndex - other.playerIdx;
  }
}

export default MahjongPlayer;
