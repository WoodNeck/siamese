import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { TILE_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class HonNodu {
  public static check(dragon: MahjongDragon) {
    const { tiles } = dragon;

    const isHonNodu = tiles.every(tile => {
      return tile.type === TILE_TYPE.KAZE
        || tile.type === TILE_TYPE.SANGEN
        || tile.index === 0
        || tile.index === 8;
    });

    return isHonNodu ? 2 : 0;
  }

  public static readonly isNormalForm = false;
  public static readonly closedOnly = false;
  public static readonly yakuName = YAKU.HONNODU;
}

export default HonNodu;
