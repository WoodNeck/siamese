import MahjongDragon from "../MahjongDragon";
import MahjongGame from "../MahjongGame";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class HaiTeiMoon {
  public static check(dragon: MahjongDragon, game: MahjongGame) {
    const { lastTile } = dragon;
    return lastTile.isTsumo && game.tiles.left === 0 ? 1 : 0;
  }

  public static readonly isNormalForm = false;
  public static readonly closedOnly = true;
  public static readonly yakuName = YAKU.HAITEI_MOON;
}

export default HaiTeiMoon;
