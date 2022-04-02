import MahjongTile from "./MahjongTile";
import MahjongTileSet from "./MahjongTileSet";
import MahjongPlayer from "./MahjongPlayer";
import MahjongGame from "./MahjongGame";
import MahjongHandsParser, { MahjongHandsInfo } from "./MahjongHandsParser";
import MahjongDragon from "./MahjongDragon";

import * as EMOJI from "~/const/emoji";
import { BODY_TYPE, KANG_TYPE } from "~/const/mahjong";

class MahjongHands {
  private _player: MahjongPlayer;
  private _game: MahjongGame;

  // 현재 손패
  private _holding: MahjongTile[];

  // 안깡 배열
  private _kang: MahjongTileSet[];

  // 버림패 배열
  private _discards: MahjongTile[];

  // 울은 패
  private _borrows: MahjongTileSet[];

  // 이전 턴에 깡한 방식
  private _prevTurnKang: KANG_TYPE;

  // 현재 패 관련 정보
  private _handsInfo: MahjongHandsInfo | null;

  public get player() { return this._player; }
  public get game() { return this._game; }
  public get holding() { return this._holding; }
  public get borrows() { return this._borrows; }
  public get kang() { return this._kang; }
  public get discards() { return this._discards; }
  public get prevTurnKang() { return this._prevTurnKang; }
  public get handsInfo() { return this._handsInfo; }

  public get tiles() {
    return [
      ...this._holding,
      ...this._kang.map(({ tiles }) => tiles).flat(1),
      ...this._borrows.map(({ tiles }) => tiles).flat(1)
    ];
  }

  public get cried() {
    return this._borrows.length > 0;
  }

  public constructor(player: MahjongPlayer, game: MahjongGame) {
    this._player = player;
    this._game = game;
    this.reset();
  }

  public reset() {
    this._holding = [];
    this._kang = [];
    this._discards = [];
    this._borrows = [];

    this._prevTurnKang = KANG_TYPE.NONE;
    this._handsInfo = null;
  }

  public init(tiles: MahjongTile[]) {
    this._holding.push(...tiles.sort((a, b) => a.id - b.id));
  }

  public add(tile: MahjongTile) {
    this._holding.push(tile);
    this._updateInfo({
      tile,
      isTsumo: true,
      isAdditiveKang: false
    });
  }

  public play(index: number): MahjongTile {
    const tile = this._holding.splice(index, 1)[0];

    this._discards.push(tile);
    this._holding.sort((a, b) => a.id - b.id);
    this._prevTurnKang = KANG_TYPE.NONE;

    this._updateInfo(null);

    return tile;
  }

  public playClosedKang(tileID: number) {
    const kangTiles = this._holding.filter(tile => tile.tileID === tileID);

    this._holding = this._holding.filter(tile => tile.tileID !== tileID);

    const redDoraIndex = kangTiles.findIndex(tile => tile.isRedDora);

    if (redDoraIndex >= 0) {
      const redDoraTile = kangTiles.splice(redDoraIndex, 1)[0];
      kangTiles.splice(1, 0, redDoraTile);
    }

    kangTiles[0].closedKang = true;
    kangTiles[3].closedKang = true;

    const kangTileSet = new MahjongTileSet({
      tiles: kangTiles,
      type: BODY_TYPE.KANG,
      borrowed: false
    });

    this._kang.push(kangTileSet);
    this._prevTurnKang = KANG_TYPE.CLOSED;
  }

  public addBorrowedTileSet(tileSet: MahjongTileSet) {
    const borrows = this._borrows;
    const addedTiles = tileSet.tiles;

    borrows.push(tileSet);

    if (tileSet.type === BODY_TYPE.KANG) {

      const prevBorrowedSetIdx = borrows.findIndex(set => {
        const isPon = set.type === BODY_TYPE.SAME;
        return isPon && set.tiles.some(tile => {
          return addedTiles.some(added => added.id === tile.id);
        });
      });

      if (prevBorrowedSetIdx >= 0) {
        borrows.splice(prevBorrowedSetIdx, 1);
        this._prevTurnKang = KANG_TYPE.ADDITIVE;
      } else {
        this._holding = this._holding.filter(tile => !addedTiles.includes(tile));
        this._prevTurnKang = KANG_TYPE.OPEN;
      }
    } else {
      this._holding = this._holding.filter(tile => !addedTiles.includes(tile));
    }
  }

  public getKangableTiles(): MahjongTile[][] {
    const holding = this._holding;
    const tilesByID = new Map<number, MahjongTile[]>();

    holding.forEach(tile => {
      tilesByID.set(tile.tileID, []);
    });

    holding.forEach(tile => {
      const tiles = tilesByID.get(tile.tileID)!;
      tiles.push(tile);
    });

    return [...tilesByID.values()].filter(tiles => tiles.length === 4);
  }

  public isRiichiable(): boolean {
    if (!this._handsInfo) return false;
    return this._handsInfo.riichiDiscardables.size > 0;
  }

  public isTenpai(): boolean {
    if (!this._handsInfo) return false;
    return this._handsInfo.tenpaiTiles.tiles.size > 0;
  }

  public isTsumoable(): boolean {
    if (!this._handsInfo) return false;
    return !!this._handsInfo.scoreInfo;
  }

  public toEmoji(): string {
    const holding = this._holding;
    const borrows = this._borrows;

    const emojis: string[] = [];

    emojis.push(holding.map(tile => tile.getEmoji()).join(""));

    borrows.forEach(({ tiles }) => {
      emojis.push(tiles.map(tile => tile.getEmoji()).join(""));
    });

    return emojis.join(EMOJI.TAB_SPACE);
  }

  private _updateInfo(lastTile: MahjongDragon["lastTile"] | null) {
    const parser = new MahjongHandsParser();

    this._handsInfo = parser.parse(this, lastTile);
  }
}

export default MahjongHands;
