import MahjongGame from "../MahjongGame";
import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { staticImplements } from "~/util/helper";
import { BODY_TYPE, TILE_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class PingHu {
  public static check(dragon: MahjongDragon, game: MahjongGame) {
    const { head, body, hands } = dragon;

    if (head.length !== 1 || body.length !== 4) return 0;

    if (body.some(combination => combination.type !== BODY_TYPE.ORDERED)) return 0;

    const currentPlayer = hands.player;
    const headTile = head[0][0];
    const isPlayerWind = headTile.type === TILE_TYPE.KAZE
      && (headTile.index === currentPlayer.wind || headTile.index === game.wind);

    if (headTile.type === TILE_TYPE.SANGEN || isPlayerWind) return 0;

    const lastTile = dragon.lastTile.tile;
    const lastCombination = body.find(comb => comb.tiles.find(tile => tile.id === lastTile.id));

    if (!lastCombination) return 0;
    const lastTileIdx = lastCombination.tiles.findIndex(tile => tile.id === lastTile.id);

    if (lastTileIdx === 1
      || (lastTileIdx === 0 && lastTile.index === 6)
      || (lastTileIdx === 2 && lastTile.index === 2)) return 0;

    return 1;
  }

  public static readonly closedOnly = true;
  public static readonly yakuName = YAKU.PINGHU;
}

export default PingHu;
