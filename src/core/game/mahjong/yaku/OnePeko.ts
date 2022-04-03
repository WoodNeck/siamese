import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { BODY_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class OnePeko {
  public static check(dragon: MahjongDragon) {
    const { body } = dragon;

    if (dragon.cried) return 0;

    const orderedBodies = body.filter(comb => comb.type === BODY_TYPE.ORDERED);

    if (orderedBodies.length < 2) return 0;

    const combinations = orderedBodies.flatMap((v1, i1) => {
      return orderedBodies.slice(i1 + 1).map(v2 => [v1, v2]);
    });

    const hasOnePeko = combinations.filter(comb => {
      const v1 = comb[0];
      const v2 = comb[1];

      return v1.tiles.every((tile, idx) => {
        return tile.tileID === v2.tiles[idx].tileID;
      });
    }).length === 1;

    return hasOnePeko ? 1 : 0;
  }

  public static readonly isNormalForm = true;
  public static readonly closedOnly = true;
  public static readonly yakuName = YAKU.ONE_PEKO;
}

export default OnePeko;
