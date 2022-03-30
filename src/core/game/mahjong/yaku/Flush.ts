import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { TILE_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class Flush {
  public static check(dragon: MahjongDragon) {
    const { tiles, hands } = dragon;
    const numTiles = tiles.filter(tile => tile.type !== TILE_TYPE.KAZE && tile.type !== TILE_TYPE.SANGEN);

    if (numTiles.length !== 14) return 0;

    const numType = numTiles[0].type;
    const allSameType = numTiles.every(tile => tile.type === numType);

    return allSameType
      ? hands.cried
        ? 5
        : 6
      : 0;
  }

  public static readonly isNormalForm = false;
  public static readonly closedOnly = false;
  public static readonly yakuName = YAKU.FLUSH;
}

export default Flush;
