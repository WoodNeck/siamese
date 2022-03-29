import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { TILE_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class BigFourWinds {
  public static check(dragon: MahjongDragon) {
    const { body } = dragon;

    const windBodies = body.filter(({ tiles }) => {
      return tiles[0].type === TILE_TYPE.KAZE;
    });

    return windBodies.length === 4 ? 13 : 0;
  }

  public static readonly closedOnly = false;
  public static readonly yakuName = YAKU.BIG_FOUR_WINDS;
}

export default BigFourWinds;
