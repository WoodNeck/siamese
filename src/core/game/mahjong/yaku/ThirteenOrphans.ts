import MahjongHands from "../MahjongHands";
import MahjongTile from "../MahjongTile";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { TILE_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class ThirteenOrphans {
  public static check() {
    return 0;
  }

  public static checkByHands(hands: MahjongHands): boolean {
    const { holding } = hands;

    const allYaoChu = holding.every(tile => ThirteenOrphans.isYaoChu(tile));

    if (!allYaoChu) return false;

    const tileCount = holding.reduce((counts, tile) => {
      if (!counts[tile.tileID]) counts[tile.tileID] = 0;

      counts[tile.tileID] += 1;
      return counts;
    }, {});

    return Object.values(tileCount).length === 13;
  }

  public static riichiableByTiles(tiles: MahjongTile[]): MahjongTile[] {
    const yaochuTiles = tiles.filter(tile => ThirteenOrphans.isYaoChu(tile));

    if (yaochuTiles.length < 13) return [];

    const discardables = tiles.map((tile, idx) => {
      const tilesExceptThis = [...tiles];
      tilesExceptThis.splice(idx, 1);
      const allYaoChu = tilesExceptThis.every(t => ThirteenOrphans.isYaoChu(t));
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

  private static isYaoChu(tile: MahjongTile) {
    if (
      tile.type === TILE_TYPE.SANGEN
      || tile.type === TILE_TYPE.KAZE
    ) return true;
    else return tile.index === 0 || tile.index === 8;
  }

  public static readonly isNormalForm = false;
  public static readonly closedOnly = true;
  public static readonly score = 13;
  public static readonly yakuName = YAKU.THIRTEEN_ORPHANS;
}

export default ThirteenOrphans;
