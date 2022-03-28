import MahjongHands from "./MahjongHands";
import MahjongSetInfo from "./MahjongSetInfo";
import MahjongTile from "./MahjongTile";
import MahjongDragon from "./MahjongDragon";
import Yaku from "./yaku/Yaku";
import ThirteenOrphans from "./yaku/ThirteenOrphans";
import { YAKU_LIST } from "./yaku";

import * as MAHJONG from "~/const/mahjong";

class MahjongSetParser {
  public parse(hands: MahjongHands): MahjongSetInfo {
    const head: MahjongTile[][] = [];
    const ordered: MahjongTile[][] = [];
    const same: MahjongTile[][] = [];
    const kang: MahjongTile[][] = [];

    const group = this._groupTilesByType(hands.holding);
    Object.keys(group).forEach(type => {
      const groupByType = group[type];

      head.push(...this._findSameByCount(groupByType, 2));
      same.push(...this._findSameByCount(groupByType, 3));
      ordered.push(...this._findOrderedByCount(type as unknown as MAHJONG.TILE_TYPE, groupByType, 3));
    });

    ordered.push(...hands.borrows.ordered);
    same.push(...hands.borrows.same);
    kang.push(...hands.kang, ...hands.borrows.kang);

    return {
      head,
      ordered,
      same,
      kang
    };
  }

  public parseCandidates(hands: MahjongHands): Omit<MahjongSetInfo, "head"> {
    const ordered: MahjongTile[][] = [];
    const same: MahjongTile[][] = [];
    const kang: MahjongTile[][] = [];

    const group = this._groupTilesByType(hands.holding);
    Object.keys(group).forEach(type => {
      const groupByType = group[type];

      same.push(...this._findSameByCount(groupByType, 2));
      kang.push(...this._findSameByCount(groupByType, 3));
      ordered.push(...this._findOrderedByCount(type as unknown as MAHJONG.TILE_TYPE, groupByType, 2));
    });

    kang.push(...hands.borrows.same);

    return {
      ordered,
      same,
      kang
    };
  }

  public parseFinished(hands: MahjongHands, set: MahjongSetInfo, isTsumo: boolean): {
    dragon: MahjongDragon;
    yaku: Yaku[];
  } | null {
    const { head, ordered, same, kang } = set;
    const tiles = hands.tiles;

    if (ThirteenOrphans.checkByHands(hands)) {
      return {
        dragon: {
          head: [],
          body: [],
          tiles
        },
        yaku: [ThirteenOrphans]
      };
    }

    const isSevenPairs = head.length === 7;

    if (isSevenPairs) {
      const dragon = { head, body: [], tiles };
      return this._processDragon(dragon, hands, isTsumo);
    }

    if (head.length !== 1 || (ordered.length + same.length + kang.length) < 4) return null;

    const body = this._getDragonBody(set);
    if (!body) return null;

    const dragon = { head, body, tiles };
    return this._processDragon(dragon, hands, isTsumo);
  }

  private _processDragon(dragon: MahjongDragon, hands: MahjongHands, isTsumo: boolean) {
    const cried = hands.cried;

    const availableYaku = YAKU_LIST.filter(yaku => {
      if (yaku.closedOnly) return !cried && yaku.check(dragon, isTsumo);
      return yaku.check(dragon, isTsumo);
    });

    if (availableYaku.length <= 0) return null;

    return {
      dragon,
      yaku: availableYaku
    };
  }

  private _groupTilesByType(tiles: MahjongTile[]): Record<MAHJONG.TILE_TYPE, MahjongTile[]> {
    const group = Object.values(MAHJONG.TILE_TYPE).reduce((result, type) => {
      result[type] = [];
      return result;
    }, {} as Record<MAHJONG.TILE_TYPE, MahjongTile[]>);

    tiles.forEach(tile => {
      group[tile.type].push(tile);
    });

    // Sort tiles
    Object.values(group).forEach(groupArr => {
      groupArr.sort((a, b) => a.id - b.id);
    });

    return group;
  }

  private _findSameByCount(group: MahjongTile[], count: number): MahjongTile[][] {
    const groupByIndex = group.reduce((result, tile) => {
      if (!result[tile.index]) result[tile.index] = [];

      result[tile.index].push(tile);

      return result;
    }, {} as Record<number, MahjongTile[]>);

    return Object.values(groupByIndex).filter(tileGroup => tileGroup.length === count);
  }

  private _findOrderedByCount(type: MAHJONG.TILE_TYPE, group: MahjongTile[], count: number): MahjongTile[][] {
    if (![MAHJONG.TILE_TYPE.MAN, MAHJONG.TILE_TYPE.PIN, MAHJONG.TILE_TYPE.SOU].includes(type)) return [];

    const groupByIndex = group.reduce((result, tile) => {
      if (!result.has(tile.index)) result.set(tile.index, []);

      result.set(tile.index, [...result.get(tile.index)!, tile]);

      return result;
    }, new Map<number, MahjongTile[]>());

    const groupKeys = [...groupByIndex.keys()].sort((a, b) => a - b);
    const sliceCount = groupKeys.length - count + 1;

    const ordered: MahjongTile[][] = [];

    for (let idx = 0; idx < sliceCount; idx++) {
      const sliced = groupKeys.slice(idx, idx + count);
      if (sliced.slice(1).every((val, i) => sliced[i] + 1 === val)) {
        ordered.push(sliced.map(key => groupByIndex.get(key)![0]));
      }
    }

    return ordered;
  }

  private _getDragonBody(set: MahjongSetInfo): MahjongTile[][] | null {
    const { ordered, same, kang } = set;

    const bodies = [...ordered, ...same];

    const combinations = kang.length > 0
      ? this._pickTwo(bodies)
      : this._pickThree(bodies);

    for (const combination of combinations) {
      const allTiles = combination.reduce((total, tiles) => [...total, ...tiles], []);
      const hasDuplication = new Set(allTiles.map(tile => tile.id)).size < allTiles.length;

      if (!hasDuplication) {
        return combination;
      }
    }

    return null;
  }

  private _pickTwo(tiles: MahjongTile[][]) {
    return tiles.flatMap((v1, i1) => {
      return tiles.slice(i1 + 1).map(v2 => [v1, v2]);
    });
  }

  private _pickThree(tiles: MahjongTile[][]) {
    return tiles.flatMap((v1, i1) => {
      return tiles.slice(i1 + 1).flatMap((v2, i2) => {
        return tiles.slice(i1 + i2 + 2).map(v3 => [v1, v2, v3]);
      });
    });
  }
}

export default MahjongSetParser;
