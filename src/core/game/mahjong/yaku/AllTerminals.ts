import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { TILE_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class AllTerminals {
  public static check(dragon: MahjongDragon) {
    const { tiles } = dragon;

    const isAllTerminals = tiles.every(tile => {
      if (tile.type === TILE_TYPE.KAZE || tile.type === TILE_TYPE.SANGEN) return false;

      return tile.index === 0 || tile.index === 8;
    });

    return isAllTerminals ? 13 : 0;
  }

  public static readonly closedOnly = false;
  public static readonly yakuName = YAKU.ALL_TERMINALS;
}

export default AllTerminals;
