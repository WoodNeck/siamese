import MahjongGame from "../MahjongGame";
import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { BODY_TYPE, TILE_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class YakuHai {
  public static check(dragon: MahjongDragon, game: MahjongGame) {
    const { body, player } = dragon;

    const sameBodies = body.filter(comb => comb.type === BODY_TYPE.SAME || comb.type === BODY_TYPE.KANG);
    const points = sameBodies.reduce((allPoints, { tiles }) => {
      const tile = tiles[0];

      if (tile.type === TILE_TYPE.SANGEN) {
        allPoints += 1;
      } else if (tile.type === TILE_TYPE.KAZE) {
        if (tile.index === player.getWind(game.round.wind)) allPoints += 1;
        if (tile.index === game.wind) allPoints += 1;
      }

      return allPoints;
    }, 0);

    return points;
  }

  public static readonly isNormalForm = true;
  public static readonly closedOnly = false;
  public static readonly yakuName = YAKU.YAKUHAI;
}

export default YakuHai;
