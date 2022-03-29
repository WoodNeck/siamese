import Discord from "discord.js";

import MahjongTile from "./MahjongTile";
import MahjongTiles from "./MahjongTiles";
import MahjongPlayer from "./MahjongPlayer";

import * as MAHJONG from "~/const/mahjong";

class MahjongGame {
  private _tiles: MahjongTiles;
  private _players: MahjongPlayer[];

  private _wind: number;
  private _round: {
    wind: number;
    turn: number;
    doraCount: number;
  };

  private _currentPlayerIdx: number;
  private _doras: MahjongTile[];
  private _uraDoras: MahjongTile[];
  private _kangTiles: MahjongTile[]; // 영상패

  public get wind() { return this._wind; }
  public get round() { return this._round; }
  public get tiles() { return this._tiles; }
  public get currentPlayer() { return this._players[this._currentPlayerIdx]; }

  public set wind(val: number) { this._wind = val; }

  public constructor(players: Array<{
    user: Discord.GuildMember;
    interaction: Discord.MessageComponentInteraction;
  }>) {
    this._doras = [];
    this._uraDoras = [];
    this._kangTiles = [];

    this._players = players.map((player, idx) => new MahjongPlayer(player, idx));
    this._currentPlayerIdx = 0;

    this._wind = MAHJONG.WIND.EAST;
    this._round = {
      wind: -1,
      turn: 0,
      doraCount: 1
    };

    this.startNewRound();
  }

  public startNewRound() {
    const tiles = new MahjongTiles();

    this._doras = tiles.draw(5);
    this._uraDoras = tiles.draw(5);
    this._kangTiles = tiles.draw(4);

    // FIXME: 친 승리인지 판별
    this._round.wind += 1;
    this._round.turn = 0;
    this._round.doraCount = 1;

    this._players.forEach((player, idx) => {
      player.reset();
      player.wind = (this._round.wind + idx) % 4;
      player.hands.add(tiles.draw(13));
    });

    this._tiles = tiles;
  }

  public nextTurn() {
    // 패 뽑기

    // 종료 판정

    // 패 버리기
  }
}

export default MahjongGame;
