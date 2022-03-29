import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { pick, staticImplements } from "~/util/helper";
import { BODY_TYPE, TILE_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class ThreeColorTriplet {
  public static check(dragon: MahjongDragon) {
    const { body } = dragon;

    const same = body.filter(({ type, tiles }) => {
      return type !== BODY_TYPE.ORDERED
        && (tiles[0].type !== TILE_TYPE.KAZE && tiles[0].type !== TILE_TYPE.SANGEN);
    });

    const hasSame = pick(same, 3).some(([set1, set2, set3]) => {
      const notSameType = set1.tiles[0].type !== set2.tiles[0].type
        && set1.tiles[0].type !== set3.tiles[0].type
        && set2.tiles[0].type !== set3.tiles[0].type;
      const sameNum = set1.tiles[0].index === set2.tiles[0].index
        && set2.tiles[0].index === set3.tiles[0].index;

      return notSameType && sameNum;
    });

    return hasSame ? 2 : 0;
  }

  public static readonly closedOnly = false;
  public static readonly yakuName = YAKU.THREE_COLOR_TRIPLET;
}

export default ThreeColorTriplet;
