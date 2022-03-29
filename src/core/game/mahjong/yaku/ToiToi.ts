import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { BODY_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class ToiToi {
  public static check(dragon: MahjongDragon) {
    const { body } = dragon;

    const isToiToi = body.every(({ type }) => type === BODY_TYPE.SAME || type === BODY_TYPE.KANG);

    return isToiToi ? 2 : 0;
  }

  public static readonly closedOnly = false;
  public static readonly yakuName = YAKU.TOITOI;
}

export default ToiToi;
