import MahjongHands from "./MahjongHands";
import MahjongSetInfo from "./MahjongSetInfo";
import MahjongTile from "./MahjongTile";
import MahjongTileSet from "./MahjongTileSet";

import { pick } from "~/util/helper";
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

    Object.keys(group).forEach(type => {
      const groupByType = group[type];

      head.push(
        ...this._findSameByCount(groupByType, 2)
          .map(tiles => new MahjongTileSet({ tiles, type: BODY_TYPE.HEAD, borrowed: false }))
      );
      same.push(
        ...this._findSameByCount(groupByType, 3)
          .map(tiles => new MahjongTileSet({ tiles, type: BODY_TYPE.SAME, borrowed: false }))
      );
      ordered.push(
        ...this._findOrdered(parseFloat(type), groupByType)
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
    Object.keys(group).forEach(type => {
      const groupByType = group[type];

      same.push(...this._findSameByCount(groupByType, 2));
      kang.push(...this._findSameByCount(groupByType, 3));
      ordered.push(...this._findOrderedCandidates(parseFloat(type), groupByType));
    });

    kang.push(...hands.borrows.filter(({ type }) => type === BODY_TYPE.SAME).map(({ tiles }) => tiles));

    return {
      ordered,
      same,
      kang
    };
  }

  private _groupTilesByType(tiles: MahjongTile[]): Record<number, MahjongTile[]> {
    const group = [
      TILE_TYPE.MAN,
      TILE_TYPE.PIN,
      TILE_TYPE.SOU,
      TILE_TYPE.KAZE,
      TILE_TYPE.SANGEN
    ].reduce((result, type) => {
      result[type] = [];
      return result;
    }, {} as Record<number, MahjongTile[]>);

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
    const combinations = pick(group, count);

    return combinations.filter(comb => {
      return comb.every((tile, idx) => {
        if (idx === 0) return true;
        const prevTile = comb[idx - 1];
        return tile.index === prevTile.index && tile.type === prevTile.type;
      });
    });
  }

  private _findOrdered(type: number, group: MahjongTile[]): MahjongTile[][] {
    const orderTypes = [TILE_TYPE.MAN, TILE_TYPE.PIN, TILE_TYPE.SOU] as number[];
    if (!orderTypes.includes(type)) return [];

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
    const orderTypes = [TILE_TYPE.MAN, TILE_TYPE.PIN, TILE_TYPE.SOU] as number[];
    if (!orderTypes.includes(type)) return [];

    const combinations = pick(group, 2);

    return combinations.filter(combination => {
      const tile1 = combination[0];
      const tile2 = combination[1];

      return tile1.index !== tile2.index && Math.abs(tile1.index - tile2.index) < 3;
    });
  }
}

export default MahjongSetParser;
