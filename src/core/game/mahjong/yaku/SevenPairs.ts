import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class SevenPairs {
  public static check(dragon: MahjongDragon) {
    return true;
  }

  public static readonly closedOnly = true;
  public static readonly score = 2;
  public static readonly yakuName = YAKU.RIICHI;
}

export default SevenPairs;
