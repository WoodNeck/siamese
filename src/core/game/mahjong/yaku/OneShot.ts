import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class OneShot {
  public static check({ hands }: MahjongDragon) {
    const player = hands.player;
    return player.riichiTurn > 0 && player.riichiTurn === player.currentTurn - 1
      ? 1
      : 0;
  }

  public static readonly closedOnly = true;
  public static readonly yakuName = YAKU.ONE_SHOT;
}

export default OneShot;
