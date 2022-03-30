import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class LinShang {
  public static check(dragon: MahjongDragon) {
    const { lastTile } = dragon;
    return lastTile.isTsumo && lastTile.isKangTile ? 1 : 0;
  }

  public static readonly isNormalForm = false;
  public static readonly closedOnly = true;
  public static readonly yakuName = YAKU.LINSHANG;
}

export default LinShang;
