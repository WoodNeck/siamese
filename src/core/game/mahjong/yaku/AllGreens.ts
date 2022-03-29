import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { TILE_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class AllGreens {
  public static check(dragon: MahjongDragon) {
    const { tiles } = dragon;

    const isAllGreen = tiles.every(tile => {
      if (tile.type === TILE_TYPE.SANGEN) {
        return tile.index === 1; // 발
      } else if (tile.type === TILE_TYPE.SOU) {
        return (tile.index % 2 === 1) || tile.index === 2;
      } else {
        return false;
      }
    });

    return isAllGreen ? 13 : 0;
  }

  public static readonly closedOnly = false;
  public static readonly yakuName = YAKU.ALL_GREENS;
}

export default AllGreens;
