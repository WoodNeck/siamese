import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { pick, range, staticImplements } from "~/util/helper";
import { YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class Straight {
  public static check(dragon: MahjongDragon) {
    const { body, hands } = dragon;
    const combinations = pick(body, 3);

    const hasStraight = combinations.some(combination => {
      const type = combination[0].tiles[0].type;
      const hasSameType = combination.every(comb => comb.tiles[0].type === type);

      if (!hasSameType) return false;

      const flags = range(9).map(() => false);
      combination.forEach(({ tiles }) => {
        tiles.forEach(tile => {
          flags[tile.index] = true;
        });
      });

      return flags.every(val => val);
    });

    return hasStraight
      ? hands.cried
        ? 1
        : 2
      : 0;
  }

  public static readonly isNormalForm = true;
  public static readonly closedOnly = false;
  public static readonly yakuName = YAKU.STRAIGHT;
}

export default Straight;
