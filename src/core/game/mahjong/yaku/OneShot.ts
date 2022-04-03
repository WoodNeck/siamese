import MahjongDragon from "../MahjongDragon";
import MahjongGame from "../MahjongGame";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class OneShot {
  public static check({ player }: MahjongDragon, game: MahjongGame) {
    return player.isRiichi && game.round.turn <= player.riichiTurn + 4
      ? 1
      : 0;
  }

  public static readonly isNormalForm = false;
  public static readonly closedOnly = true;
  public static readonly yakuName = YAKU.ONE_SHOT;
}

export default OneShot;
