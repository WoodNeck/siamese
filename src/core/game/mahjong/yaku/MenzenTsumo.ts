import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class MenzenTsumo {
  public static check(dragon: MahjongDragon) {
    return dragon.lastTile.isTsumo ? 1 : 0;
  }

  public static readonly closedOnly = true;
  public static readonly yakuName = YAKU.MENZEN_TSUMO;
}

export default MenzenTsumo;
