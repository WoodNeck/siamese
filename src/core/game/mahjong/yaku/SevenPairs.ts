import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class SevenPairs {
  public static check(dragon: MahjongDragon) {
    return dragon.head.length === 7 ? 2 : 0;
  }

  public static readonly closedOnly = true;
  public static readonly yakuName = YAKU.SEVEN_PAIRS;
}

export default SevenPairs;
