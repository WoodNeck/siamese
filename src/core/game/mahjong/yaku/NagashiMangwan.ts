import MahjongHands from "../MahjongHands";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { YAKU } from "~/const/mahjong";
import { isYaoChu } from "~/util/mahjong";

@staticImplements<Yaku>()
class NagashiMangwan {
  public static check() {
    return 0;
  }

  public static checkByHands(hands: MahjongHands): boolean {
    if (hands.discards.length <= 0) return false;
    return hands.discards.every(tile => isYaoChu(tile) && !tile.lent);
  }

  public static readonly isNormalForm = false;
  public static readonly closedOnly = true;
  public static readonly yakuName = YAKU.NAGASHI_MANGWAN;
}

export default NagashiMangwan;
