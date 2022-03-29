import MahjongTile from "./MahjongTile";
import MahjongPlayer from "./MahjongPlayer";
import MahjongSetParser from "./MahjongSetParser";
import MahjongGame from "./MahjongGame";

import { pick } from "~/util/helper";
import { TILE_TYPE } from "~/const/mahjong";

class MahjongHands {
  public player: MahjongPlayer;
  public holding: MahjongTile[];
  public kang: MahjongTile[][];
  public discards: MahjongTile[];
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
    return this.borrows.ordered.length > 0
      || this.borrows.same.length > 0
      || this.borrows.kang.length > 0;
  }

  public constructor(player: MahjongPlayer) {
    this.player = player;
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
  }

  public add(tiles: MahjongTile[]) {
    this.holding.push(...tiles);
  }

  public play(index: number): MahjongTile {
    const tile = this.holding.splice(index, 1)[0];

    this.discards.push(tile);
    this.holding.sort((a, b) => a.id - b.id);

    return tile;
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
    const parser = new MahjongSetParser();
    const set = parser.parse(this);
    const tiles = this.tiles;

    const combinations = [
      ...set.head,
      ...set.ordered,
      ...set.same,
      ...set.kang
    ];

    const riichiableCombinations = pick(combinations, 4).filter(combination => {
      const allTiles = combination.reduce((total, comb) => {
        return [...total, ...comb.tiles];
      }, []);
      const tilesSet = new Set<MahjongTile>(allTiles);

      const hasDuplication = tilesSet.size < allTiles.length;
      if (hasDuplication) return false;

      const leftover = tiles.filter(tile => !tilesSet.has(tile));

      // FIXME: 치또이츠 & 국사무쌍 리치 확인
      // FIXME: 버림패에 있는지 여부 확인
      if (leftover.length === 2) {
        return true; // 어느쪽이든 단기대기
      }
      if (leftover.length === 3) {
        const cases = pick(leftover, 2);
        for (const tileCase of cases) {
          const tile1 = tileCase[0];
          const tile2 = tileCase[1];

          if (tile1.type !== tile2.type) return false;
          if (tile1.tileID === tile2.tileID) return true;
          if (tile1.type === TILE_TYPE.SANGEN || tile1.type === TILE_TYPE.KAZE) return false;

          return Math.abs(tile1.index - tile2.index) < 3;
        }
      }

      return false;
    });

    // TODO: 리치 가능한 타일 캐시

    return riichiableCombinations.length > 0;
  }

  public isTsumoable(game: MahjongGame): boolean {
    const parser = new MahjongSetParser();
    const holding = this.holding;
    const set = parser.parse(this);
    const lastTile = holding[holding.length - 1];

    const finished = parser.parseFinished(this, set, game, {
      tile: lastTile,
      isTsumo: true,
      isKangTile: false,
      isAdditiveKang: false
    });

    // TODO: 쯔모시에 점수 및 역들 캐시

    return !!finished;
  }
}

export default MahjongHands;
