import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class Riichi {
  public static check({ hands }: MahjongDragon) {
    // FIXME: 더블리치 체크
    return hands.player.riichiTurn >= 0 ? 1 : 0;
  }

  public static readonly closedOnly = true;
  public static readonly yakuName = YAKU.RIICHI;
}

export default Riichi;
