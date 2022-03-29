import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { BODY_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class FourQuads {
  public static check(dragon: MahjongDragon) {
    const { body } = dragon;

    const kangs = body.filter(({ type }) => {
      return type === BODY_TYPE.KANG;
    });

    return kangs.length === 4 ? 13 : 0;
  }

  public static readonly closedOnly = false;
  public static readonly yakuName = YAKU.FOUR_QUADS;
}

export default FourQuads;
