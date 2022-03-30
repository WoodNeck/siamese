import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { TILE_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class TangYao {
  public static check(dragon: MahjongDragon) {
    const { tiles } = dragon;

    const isTangYao = tiles.every(tile => {
      if (tile.type === TILE_TYPE.SANGEN || tile.type === TILE_TYPE.KAZE) return false;

      return tile.index !== 0 && tile.index !== 8;
    });

    return isTangYao ? 1 : 0;
  }

  public static readonly isNormalForm = false;
  public static readonly closedOnly = false;
  public static readonly yakuName = YAKU.TANGYAO;
}

export default TangYao;
