import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { BODY_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class FourClosed {
  public static check(dragon: MahjongDragon) {
    const { head, body } = dragon;

    if (head.length !== 1 || body.length !== 4) return 0;

    const closed = body.every(({ type }) => {
      return type === BODY_TYPE.SAME || type === BODY_TYPE.KANG;
    });

    return closed ? 13 : 0;
  }

  public static readonly isNormalForm = true;
  public static readonly closedOnly = true;
  public static readonly yakuName = YAKU.FOUR_CLOSED;
}

export default FourClosed;
