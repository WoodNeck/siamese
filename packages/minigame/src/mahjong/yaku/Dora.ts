import MahjongGame from "../MahjongGame";
import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { TILE_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class Dora {
  public static check(dragon: MahjongDragon, game: MahjongGame) {
    const doraCount = game.round.doraCount;
    const isRiichi = dragon.player.isRiichi;

    const doras = game.doras.slice(0, doraCount);
    if (isRiichi) {
      doras.push(...game.uraDoras.slice(0, doraCount));
    }

    const bounsTileIDs = doras.map(dora => {
      if (
        dora.type === TILE_TYPE.KAZE
      ) {
        return dora.index === 3
          ? dora.tileID - 3
          : dora.tileID + 1;
      } else if (dora.type === TILE_TYPE.SANGEN) {
        return dora.index === 2
          ? dora.tileID - 2
          : dora.tileID + 1;
      } else {
        return dora.index === 8
          ? dora.tileID - 8
          : dora.tileID + 1;
      }
    });

    return dragon.tiles.reduce((total, tile) => {
      const bonus = tile.isRedDora ? 1 : 0;
      return total + bounsTileIDs.filter(id => id === tile.tileID).length + bonus;
    }, 0);
  }

  public static readonly isNormalForm = false;
  public static readonly closedOnly = false;
  public static readonly yakuName = YAKU.DORA;
}

export default Dora;
