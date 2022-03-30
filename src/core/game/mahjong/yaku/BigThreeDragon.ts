import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { TILE_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class BigThreeDragon {
  public static check(dragon: MahjongDragon) {
    const { body } = dragon;

    const sangenBodies = body.filter(({ tiles }) => {
      return tiles[0].type === TILE_TYPE.SANGEN;
    });

    return sangenBodies.length === 3 ? 13 : 0;
  }

  public static readonly isNormalForm = true;
  public static readonly closedOnly = false;
  public static readonly yakuName = YAKU.BIG_THREE_DRAGON;
}

export default BigThreeDragon;
