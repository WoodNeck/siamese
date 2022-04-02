import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class Riichi {
  public static check({ player }: MahjongDragon) {
    return player.isRiichi
      ? player.riichiTurn === player.getWind(player.hands.game.round.wind)
        ? 2 // 더블 리치
        : 1
      : 0;
  }

  public static readonly isNormalForm = false;
  public static readonly closedOnly = true;
  public static readonly yakuName = YAKU.RIICHI;
}

export default Riichi;
