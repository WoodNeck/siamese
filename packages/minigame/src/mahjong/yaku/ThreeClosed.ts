import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { BODY_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class ThreeClosed {
  public static check(dragon: MahjongDragon) {
    const { body } = dragon;

    const closed = body.filter(({ type, borrowed }) => {
      return (type === BODY_TYPE.SAME || type === BODY_TYPE.KANG) && !borrowed;
    });

    return closed.length === 3 ? 2 : 0;
  }

  public static readonly isNormalForm = true;
  public static readonly closedOnly = false;
  public static readonly yakuName = YAKU.THREE_CLOSED;
}

export default ThreeClosed;
