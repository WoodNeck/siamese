import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class ChangKang {
  public static check(dragon: MahjongDragon) {
    const { lastTile } = dragon;
    return lastTile.isAdditiveKang ? 1 : 0;
  }

  public static readonly closedOnly = true;
  public static readonly yakuName = YAKU.CHANGKANG;
}

export default ChangKang;
