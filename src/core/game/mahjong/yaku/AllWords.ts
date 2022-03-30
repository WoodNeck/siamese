import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { TILE_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class AllWords {
  public static check(dragon: MahjongDragon) {
    const { tiles } = dragon;

    const isAllWords = tiles.every(tile => {
      return tile.type === TILE_TYPE.SANGEN || tile.type === TILE_TYPE.KAZE;
    });

    return isAllWords ? 13 : 0;
  }

  public static readonly isNormalForm = false;
  public static readonly closedOnly = false;
  public static readonly yakuName = YAKU.ALL_WORDS;
}

export default AllWords;
