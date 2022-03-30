import MahjongTile from "./MahjongTile";
import MahjongPlayer from "./MahjongPlayer";
import MahjongSetParser from "./MahjongSetParser";
import MahjongGame from "./MahjongGame";
import SevenPairs from "./yaku/SevenPairs";
import ThirteenOrphans from "./yaku/ThirteenOrphans";

import { pick } from "~/util/helper";
import { BODY_TYPE, KANG_TYPE, TILE_TYPE } from "~/const/mahjong";
import { ValueOf } from "~/type/helper";

class MahjongHands {
  public player: MahjongPlayer;
  public holding: MahjongTile[];
  public kang: MahjongTile[][];
  public discards: MahjongTile[];
  public riichiDiscardables: Set<MahjongTile>;
  public scoreInfo: ReturnType<MahjongSetParser["parseFinished"]>;
  public prevTurnKang: ValueOf<typeof KANG_TYPE>;
  public borrows: {
    ordered: MahjongTile[][];
    same: MahjongTile[][];
    kang: MahjongTile[][];
  };

  public get tiles() {
    return [
      ...this.holding,
      ...this.kang.flat(1),
      ...this.borrows.ordered.flat(1),
      ...this.borrows.same.flat(1),
      ...this.borrows.kang.flat(1)
    ];
  }

  public get cried() {
    const { ordered, same, kang } = this.borrows;
    return ordered.length > 0
      || same.length > 0
      || kang.length > 0;
  }

  public constructor(player: MahjongPlayer) {
    this.player = player;
    this.riichiDiscardables = new Set();
    this.scoreInfo = null;
    this.reset();
  }

  public reset() {
    this.holding = [];
    this.kang = [];
    this.borrows = {
      ordered: [],
      same: [],
      kang: []
    };
    this.discards = [];
    this.prevTurnKang = KANG_TYPE.NONE;
  }

  public add(tiles: MahjongTile[]) {
    this.holding.push(...tiles);
  }

  public play(index: number): MahjongTile {
    const tile = this.holding.splice(index, 1)[0];

    this.discards.push(tile);
    this.holding.sort((a, b) => a.id - b.id);
    this.riichiDiscardables.clear();
    this.scoreInfo = null;
    this.prevTurnKang = KANG_TYPE.NONE;

    return tile;
  }

  public playKang(tileID: number) {
    const borrows = this.borrows;
    const kangTiles = this.holding.filter(tile => tile.tileID === tileID);
    this.holding = this.holding.filter(tile => tile.tileID !== tileID);

    if (kangTiles.length === 4) {
      this.kang.push(kangTiles);

      this.prevTurnKang = KANG_TYPE.CLOSED;
    } else if (kangTiles.length === 3) {
      // TODO: 대명깡 구현
    } else if (kangTiles.length === 1) {
      const singleTile = kangTiles[0];
      const sameTilesIdx = borrows.same.findIndex(tiles => tiles[0].tileID === tileID);
      const sameTiles = borrows.same.splice(sameTilesIdx, 1)[0];

      sameTiles.splice(sameTiles.findIndex(tile => tile.borrowed), 0, singleTile);
      borrows.kang.push(sameTiles);

      this.prevTurnKang = KANG_TYPE.ADDITIVE;
    }
  }

  public getKangableTiles(): MahjongTile[][] {
    const holding = this.holding;
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
    if (this.cried) return false;

    const parser = new MahjongSetParser();
    const set = parser.parse(this);
    const tiles = this.tiles;

    const combinations = [
      ...set.head,
      ...set.ordered,
      ...set.same,
      ...set.kang
    ];

    const discardables = pick(combinations, 4).map(combination => {
      const headCount = combination.filter(comb => comb.type === BODY_TYPE.HEAD).length;

      if (headCount !== 1) return null;

      const allTiles = combination.reduce((total, comb) => {
        return [...total, ...comb.tiles];
      }, []);
      const tilesSet = new Set<MahjongTile>(allTiles);

      const hasDuplication = tilesSet.size < allTiles.length;
      if (hasDuplication) return null;

      const leftover = tiles.filter(tile => !tilesSet.has(tile));

      if (leftover.length === 2) {
        return leftover; // 어느쪽이든 단기대기
      }

      if (leftover.length === 3) {
        const cases = pick([0, 1, 2], 2);

        for (const [idx0, idx1] of cases) {
          const tile1 = leftover[idx0];
          const tile2 = leftover[idx1];
          const leftoverTile = leftover[3 - idx0 - idx1];

          if (tile1.type !== tile2.type) return null;
          if (tile1.tileID === tile2.tileID) return [leftoverTile];
          if (tile1.type === TILE_TYPE.SANGEN || tile1.type === TILE_TYPE.KAZE) return null;
          if (Math.abs(tile1.index - tile2.index) < 3) return [leftoverTile];
        }
      }

      return null;
    }).filter(val => !!val).flat(1) as MahjongTile[];

    discardables.push(...SevenPairs.riichiableBySet(set, tiles));
    discardables.push(...ThirteenOrphans.riichiableByTiles(tiles));

    if (discardables.length <= 0) return false;

    const discards = this.discards;
    const discardablesSet = new Set(discardables);

    for (const tile of discardablesSet.values()) {
      if (discards.includes(tile)) return false;
    }

    this.riichiDiscardables = discardablesSet;
    return true;
  }

  public isTsumoable(game: MahjongGame): boolean {
    const parser = new MahjongSetParser();
    const holding = this.holding;
    const set = parser.parse(this);
    const lastTile = holding[holding.length - 1];

    this.scoreInfo = parser.parseFinished(this, set, game, {
      tile: lastTile,
      isTsumo: true,
      isKangTile: false,
      isAdditiveKang: false
    });

    return !!this.scoreInfo;
  }
}

export default MahjongHands;
