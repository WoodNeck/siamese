import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { pick, staticImplements } from "~/util/helper";
import { BODY_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class ThreeColorStraight {
  public static check(dragon: MahjongDragon) {
    const { body, hands } = dragon;
    const ordered = body.filter(({ type }) => type === BODY_TYPE.ORDERED);

    const hasSame = pick(ordered, 3).some(([set1, set2, set3]) => {
      const notSameType = set1.tiles[0].type !== set2.tiles[0].type
        && set1.tiles[0].type !== set3.tiles[0].type
        && set2.tiles[0].type !== set3.tiles[0].type;
      const sameNum = set1.tiles.every((tile, idx) => {
        return tile.index === set2.tiles[idx].index
          && tile.index === set3.tiles[idx].index;
      });

      return notSameType && sameNum;
    });

    return hasSame
      ? hands.cried
        ? 1
        : 2
      : 0;
  }

  public static readonly closedOnly = false;
  public static readonly yakuName = YAKU.THREE_COLOR_STRAIGHT;
}

export default ThreeColorStraight;
