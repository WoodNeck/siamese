import Discord from "discord.js";

import MahjongTile from "./MahjongTile";
import MahjongTiles from "./MahjongTiles";
import MahjongHands from "./MahjongHands";

import * as MAHJONG from "~/const/mahjong";

class MahjongGame {
  private _tiles: MahjongTiles;

  private _players: Array<{
    user: Discord.GuildMember;
    interaction: Discord.MessageComponentInteraction;
    point: number;
    hands: MahjongHands;
  }>;

  private _round: {
    wind: MAHJONG.WIND;
    turn: number;
    doraCount: number;
  };

  private _doras: MahjongTile[];
  private _uraDoras: MahjongTile[];
  private _kangTiles: MahjongTile[]; // 영상패

  public constructor(players: Array<{
    user: Discord.GuildMember;
    interaction: Discord.MessageComponentInteraction;
  }>) {
    this._doras = [];
    this._uraDoras = [];
    this._kangTiles = [];

    this._players = players.map(player => ({
      ...player,
      point: 25000,
      hands: new MahjongHands()
    }));

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

    this._players.forEach(player => {
      player.hands.reset();
      player.hands.add(tiles.draw(13));
    });

    // FIXME: 친 승리인지 판별
    this._round.wind += 1;
    this._round.turn = 0;
    this._round.doraCount = 1;

    this._tiles = tiles;
  }

  public nextTurn() {
    // 패 뽑기

    // 종료 판정

    // 패 버리기
  }
}

export default MahjongGame;
