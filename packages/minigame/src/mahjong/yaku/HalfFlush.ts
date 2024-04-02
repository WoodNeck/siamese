import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { TILE_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class HalfFlush {
  public static check(dragon: MahjongDragon) {
    const { tiles, cried } = dragon;
    const hasCharTile = tiles.some(tile => tile.type === TILE_TYPE.KAZE || tile.type === TILE_TYPE.SANGEN);
    const numTiles = tiles.filter(tile => tile.type !== TILE_TYPE.KAZE && tile.type !== TILE_TYPE.SANGEN);

    if (!hasCharTile || numTiles.length <= 0) return 0;

    const numType = numTiles[0].type;
    const allSameType = numTiles.every(tile => tile.type === numType);

    return allSameType
      ? cried
        ? 2
        : 3
      : 0;
  }

  public static readonly isNormalForm = false;
  public static readonly closedOnly = false;
  public static readonly yakuName = YAKU.HALF_FLUSH;
}

export default HalfFlush;
