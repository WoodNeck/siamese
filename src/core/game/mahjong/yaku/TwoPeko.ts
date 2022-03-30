import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { BODY_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class TwoPeko {
  public static check(dragon: MahjongDragon) {
    const { body } = dragon;

    const orderedBodies = body.filter(comb => comb.type === BODY_TYPE.ORDERED);

    if (orderedBodies.length < 2) return 0;

    const combinations = orderedBodies.flatMap((v1, i1) => {
      return orderedBodies.slice(i1 + 1).map(v2 => [v1, v2]);
    });

    const hasTwoPeko = combinations.filter(comb => {
      const v1 = comb[0];
      const v2 = comb[1];

      return v1.tiles.every((tile, idx) => {
        return tile.tileID === v2.tiles[idx].tileID;
      });
    }).length === 2;

    return hasTwoPeko ? 3 : 0;
  }

  public static readonly isNormalForm = true;
  public static readonly closedOnly = true;
  public static readonly yakuName = YAKU.TWO_PEKO;
}

export default TwoPeko;
