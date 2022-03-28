import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class MenzenTsumo {
  public static check(dragon: MahjongDragon, isTsumo: boolean) {
    return isTsumo;
  }

  public static readonly closedOnly = true;
  public static readonly score = 1;
  public static readonly yakuName = YAKU.MENZEN_TSUMO;
}

export default MenzenTsumo;
