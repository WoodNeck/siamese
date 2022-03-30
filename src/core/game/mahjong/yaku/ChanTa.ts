import MahjongDragon from "../MahjongDragon";
import MahjongTile from "../MahjongTile";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { TILE_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class ChanTa {
  public static check(dragon: MahjongDragon) {
    const { head, body, hands } = dragon;
    const isChanTa = head.every(tiles => ChanTa.isYoguTile(tiles))
      && body.every(({ tiles }) => ChanTa.isYoguTile(tiles));

    return isChanTa
      ? hands.cried
        ? 1
        : 2
      : 0;
  }

  public static isYoguTile(tiles: MahjongTile[]) {
    return tiles.some(tile => {
      if (tile.type === TILE_TYPE.KAZE || tile.type === TILE_TYPE.SANGEN) return true;

      return tile.index === 0 || tile.index === 8;
    });
  }

  public static readonly isNormalForm = true;
  public static readonly closedOnly = false;
  public static readonly yakuName = YAKU.CHANTA;
}

export default ChanTa;
