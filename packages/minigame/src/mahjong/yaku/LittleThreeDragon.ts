import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { TILE_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class LittleThreeDragon {
  public static check(dragon: MahjongDragon) {
    const { head, body } = dragon;

    if (head.length <= 0 || head[0][0].type !== TILE_TYPE.SANGEN) return 0;

    const sangenBodies = body.filter(({ tiles }) => {
      return tiles[0].type === TILE_TYPE.SANGEN;
    });

    return sangenBodies.length === 2 ? 2 : 0;
  }

  public static readonly isNormalForm = true;
  public static readonly closedOnly = false;
  public static readonly yakuName = YAKU.LITTLE_THREE_DRAGON;
}

export default LittleThreeDragon;
