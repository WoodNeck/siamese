import MahjongTile from "../MahjongTile";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { YAKU } from "~/const/mahjong";
import { isYaoChu } from "~/util/mahjong";

@staticImplements<Yaku>()
class ThirteenOrphans {
  public static check() {
    return 0;
  }

  public static checkByTiles(tiles: MahjongTile[]): boolean {
    const allYaoChu = tiles.every(tile => isYaoChu(tile) && !tile.borrowed);

    if (!allYaoChu) return false;

    const tileCount = tiles.reduce((counts, tile) => {
      if (!counts[tile.tileID]) counts[tile.tileID] = 0;

      counts[tile.tileID] += 1;
      return counts;
    }, {});

    return Object.values(tileCount).length === 13;
  }

  public static riichiableByTiles(tiles: MahjongTile[]): MahjongTile[] {
    const yaochuTiles = tiles.filter(tile => isYaoChu(tile));

    if (yaochuTiles.length < 13) return [];

    const discardables = tiles.map((tile, idx) => {
      const tilesExceptThis = [...tiles];
      tilesExceptThis.splice(idx, 1);
      const allYaoChu = tilesExceptThis.every(t => isYaoChu(t));
      if (!allYaoChu) return null;

      const yaochuCount = tilesExceptThis.reduce((counts, t) => {
        if (!counts[t.tileID]) counts[t.tileID] = 0;

        counts[t.tileID] += 1;
        return counts;
      }, {});

      return Object.values(yaochuCount).length >= 12
        ? tile
        : null;
    }).filter(val => !!val);

    return discardables as MahjongTile[];
  }

  public static getTenpaiCandidates(tiles: MahjongTile[]): number[] {
    const allYaoChu = tiles.every(tile => isYaoChu(tile));

    if (!allYaoChu) return [];

    const yaochuCountMap = tiles.reduce((counts, t) => {
      if (!counts[t.tileID]) counts[t.tileID] = 0;

      counts[t.tileID] += 1;
      return counts;
    }, {});

    const yaoChuTilesCount = Object.values(yaochuCountMap).length;

    if (yaoChuTilesCount >= 12) {
      const yaochus = [
        9 * 0 + 0,
        9 * 0 + 8,
        9 * 1 + 0,
        9 * 1 + 8,
        9 * 2 + 0,
        9 * 2 + 8,
        9 * 3 + 0,
        9 * 3 + 1,
        9 * 3 + 2,
        9 * 3 + 3,
        9 * 4 + 0,
        9 * 4 + 1,
        9 * 4 + 2
      ];

      // 국사무쌍 텐파이
      if (yaoChuTilesCount === 12) {
        return yaochus.filter(id => !yaochuCountMap[id]);
      } else {
        // 13면팅
        return yaochus;
      }
    } else {
      return [];
    }
  }

  public static readonly isNormalForm = false;
  public static readonly closedOnly = true;
  public static readonly score = 13;
  public static readonly yakuName = YAKU.THIRTEEN_ORPHANS;
}

export default ThirteenOrphans;
