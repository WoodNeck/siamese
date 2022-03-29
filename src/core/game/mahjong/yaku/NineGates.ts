import MahjongDragon from "../MahjongDragon";

import Yaku from "./Yaku";

import { range, staticImplements } from "~/util/helper";
import { TILE_TYPE, YAKU } from "~/const/mahjong";

@staticImplements<Yaku>()
class NineGates {
  public static check(dragon: MahjongDragon) {
    const { tiles } = dragon;

    const hasCharTile = tiles.some(tile => tile.type === TILE_TYPE.KAZE || tile.type === TILE_TYPE.SANGEN);

    if (hasCharTile) return 0;

    const tileType = tiles[0].type;
    const allSameType = tiles.every(tile => tile.type === tileType);

    if (!allSameType) return 0;

    const counts = new Map<number, number>();
    range(9).forEach(idx => counts.set(idx, 0));

    tiles.forEach(tile => {
      counts.set(tile.index, counts.get(tile.index)! + 1);
    });

    const isNineGates = range(9).every(idx => {
      const count = counts.get(idx)!;
      if (idx === 0 || idx === 8) return count >= 3;
      return count >= 1;
    });

    return isNineGates
      ? 13
      : 0;
  }

  public static readonly closedOnly = true;
  public static readonly yakuName = YAKU.NINE_GATES;
}

export default NineGates;
