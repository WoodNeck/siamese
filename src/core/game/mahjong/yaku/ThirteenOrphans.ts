import MahjongHands from "../MahjongHands";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { TILE_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class ThirteenOrphans {
  public static check() {
    return false;
  }

  public static checkByHands(hands: MahjongHands) {
    const { holding } = hands;

    const allYaoChu = holding.every(tile => {
      if (
        tile.type === TILE_TYPE.MAN
        || tile.type === TILE_TYPE.PIN
        || tile.type === TILE_TYPE.SOU
      ) {
        return tile.index === 0 || tile.index === 8;
      } else return true;
    });

    if (!allYaoChu) return;

    const tileCount = holding.reduce((counts, tile) => {
      if (!counts[tile.tileID]) counts[tile.tileID] = 0;

      counts[tile.tileID] += 1;
      return counts;
    }, {});

    return Object.values(tileCount).filter(val => val === 1).length === 13;
  }

  public static readonly closedOnly = true;
  public static readonly score = 13;
  public static readonly yakuName = YAKU.RIICHI;
}

export default ThirteenOrphans;
