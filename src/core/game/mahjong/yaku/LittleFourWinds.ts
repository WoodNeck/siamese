import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { TILE_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class LittleFourWinds {
  public static check(dragon: MahjongDragon) {
    const { head, body } = dragon;

    if (head.length <= 0 || head[0][0].type !== TILE_TYPE.KAZE) return 0;

    const windBodies = body.filter(({ tiles }) => {
      return tiles[0].type === TILE_TYPE.KAZE;
    });

    return windBodies.length === 3 ? 13 : 0;
  }

  public static readonly closedOnly = false;
  public static readonly yakuName = YAKU.LITTLE_FOUR_WINDS;
}

export default LittleFourWinds;
