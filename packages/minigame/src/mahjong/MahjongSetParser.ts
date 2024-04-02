import MahjongHands from "./MahjongHands";
import MahjongSetInfo from "./MahjongSetInfo";
import MahjongTile from "./MahjongTile";
import MahjongTileSet from "./MahjongTileSet";

import { pick, range } from "~/util/helper";
import { BODY_TYPE, TILE_TYPE } from "~/const/mahjong";

class MahjongSetParser {
  public static checkYaoChu(tile: MahjongTile) {
    if (
      tile.type === TILE_TYPE.SANGEN
      || tile.type === TILE_TYPE.KAZE
    ) {
      return true;
    } else {
      return tile.index === 0 || tile.index === 8;
    }
  }

  public parse(holding: MahjongTile[], borrows: MahjongTileSet[], closedKang: MahjongTileSet[]): MahjongSetInfo {
    const head: MahjongTileSet[] = [];
    const ordered: MahjongTileSet[] = [];
    const same: MahjongTileSet[] = [];
    const kang: MahjongTileSet[] = [];

    const group = this._groupTilesByType(holding);

    group.forEach((groupByType, type) => {
      head.push(
        ...this._findSameByCount(groupByType, 2)
          .map(tiles => new MahjongTileSet({ tiles, type: BODY_TYPE.HEAD, borrowed: false }))
      );
      same.push(
        ...this._findSameByCount(groupByType, 3)
          .map(tiles => new MahjongTileSet({ tiles, type: BODY_TYPE.SAME, borrowed: false }))
      );
      ordered.push(
        ...this._findOrdered(type, groupByType)
          .map(tiles => new MahjongTileSet({ tiles, type: BODY_TYPE.ORDERED, borrowed: false })));
    });

    ordered.push(...borrows.filter(({ type }) => type === BODY_TYPE.ORDERED));
    same.push(...borrows.filter(({ type }) => type === BODY_TYPE.SAME));
    kang.push(
      ...closedKang,
      ...borrows.filter(({ type }) => type === BODY_TYPE.KANG)
    );

    return {
      head,
      ordered,
      same,
      kang
    };
  }

  public parseCandidates(hands: MahjongHands): {
    ordered: MahjongTile[][];
    same: MahjongTile[][];
    kang: MahjongTile[][];
  } {
    const ordered: MahjongTile[][] = [];
    const same: MahjongTile[][] = [];
    const kang: MahjongTile[][] = [];

    const group = this._groupTilesByType(hands.holding);
    group.forEach((groupByType, type) => {
      same.push(...this._findSameByCount(groupByType, 2));
      kang.push(...this._findSameByCount(groupByType, 3));
      ordered.push(...this._findOrderedCandidates(type, groupByType));
    });

    return {
      ordered,
      same,
      kang
    };
  }

  private _groupTilesByType(tiles: MahjongTile[]) {
    const group = [
      ...range(5).map(() => [])
    ] as MahjongTile[][];

    tiles.forEach(tile => {
      group[tile.type].push(tile);
    });

    // Sort tiles
    group.forEach(groupArr => {
      groupArr.sort((a, b) => a.id - b.id);
    });

    return group;
  }

  private _findSameByCount(group: MahjongTile[], count: number): MahjongTile[][] {
    const combinations = pick(group, count);
    const idMap = new Map<number, boolean>();

    return combinations.filter(comb => {
      const isSame = comb.every((tile, idx) => {
        if (idx === 0) return true;
        const prevTile = comb[idx - 1];
        return tile.index === prevTile.index && tile.type === prevTile.type;
      });

      if (!isSame) return false;

      const redDora = comb.find(tile => tile.isRedDora);
      const combID = redDora
        ? -redDora.type
        : comb[0].tileID;

      if (idMap.has(combID)) return false;

      idMap.set(combID, true);
      return true;
    });
  }

  private _findOrdered(type: number, group: MahjongTile[]): MahjongTile[][] {
    if (type > TILE_TYPE.SOU) return [];

    const combinations = pick(group, 3);

    return combinations.filter(combination => {
      return combination.every((tile, idx) => {
        if (idx === 0) return true;
        const prev = combination[idx - 1];
        return tile.index === prev.index + 1;
      });
    });
  }

  private _findOrderedCandidates(type: number, group: MahjongTile[]): MahjongTile[][] {
    if (type > TILE_TYPE.SOU) return [];

    const combinations = pick(group, 2);
    const idMap = new Map<number, boolean>();

    return combinations.filter(combination => {
      const tile1 = combination[0];
      const tile2 = combination[1];

      const isOrdered = tile1.index !== tile2.index && Math.abs(tile1.index - tile2.index) < 3;

      if (!isOrdered) return false;

      const combID = combination.reduce((total, tile) => {
        const id = tile.isRedDora ? -tile.type : tile.tileID;
        return total + id;
      }, 0);

      if (idMap.has(combID)) return false;

      idMap.set(combID, true);
      return true;
    });
  }
}

export default MahjongSetParser;
