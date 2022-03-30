import MahjongDragon from "../MahjongDragon";
import MahjongTile from "../MahjongTile";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { TILE_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class JunChanTa {
  public static check(dragon: MahjongDragon) {
    const { head, body, hands } = dragon;
    const isChanTa = head.every(tiles => JunChanTa.isYoguTile(tiles))
      && body.every(({ tiles }) => JunChanTa.isYoguTile(tiles));

    return isChanTa
      ? hands.cried
        ? 2
        : 3
      : 0;
  }

  public static isYoguTile(tiles: MahjongTile[]) {
    return tiles.some(tile => {
      if (tile.type === TILE_TYPE.KAZE || tile.type === TILE_TYPE.SANGEN) return false;

      return tile.index === 0 || tile.index === 8;
    });
  }

  public static readonly isNormalForm = true;
  public static readonly closedOnly = false;
  public static readonly yakuName = YAKU.JUN_CHANTA;
}

export default JunChanTa;
