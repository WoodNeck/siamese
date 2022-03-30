import MahjongDragon from "../MahjongDragon";
import MahjongSetInfo from "../MahjongSetInfo";
import MahjongTile from "../MahjongTile";

import Yaku from "./Yaku";

import { pick, staticImplements } from "~/util/helper";
import { YAKU } from "~/const/mahjong";


@staticImplements<Yaku>()
class SevenPairs {
  public static check(dragon: MahjongDragon) {
    const { head } = dragon;

    if (head.length < 7) return 0;

    const combinations = pick(head, 7)
      .filter(heads => SevenPairs.isSevenPairs(heads));

    return combinations.length > 0 ? 2 : 0;
  }

  /**
   * @returns Array<머리(7)>
   */
  public static checkBySet(set: MahjongSetInfo): MahjongTile[][][] {
    const { head } = set;

    if (head.length < 7) return [];

    const combinations = pick(head.map(({ tiles }) => tiles), 7)
      .filter(heads => SevenPairs.isSevenPairs(heads));

    return combinations;
  }

  public static isSevenPairs(heads: MahjongTile[][]) {
    const flatHeads = [...heads].flat(1);

    const tileIDCount = flatHeads.reduce((count, head) => {
      if (!count[head.tileID]) count[head.tileID] = 0;
      count[head.tileID] += 1;
      return count;
    }, {});
    const hasDuplication = new Set(flatHeads).size < flatHeads.length;
    const has4 = Object.values(tileIDCount).some(val => val === 4);

    return !hasDuplication && !has4;
  }

  public static riichiableBySet(set: MahjongSetInfo, allTiles: MahjongTile[]): MahjongTile[] {
    const { head } = set;

    if (head.length < 6) return [];

    const discardables = pick(head.map(({ tiles }) => tiles), 6)
      .map(combination => {
        const combTiles = combination.reduce((total, comb) => [...total, ...comb], []);
        const tileSet = new Set(combTiles);
        const hasDuplication = tileSet.size < combTiles.length;

        if (hasDuplication) return null;
        else return allTiles.filter(tile => !tileSet.has(tile));
      }).filter(val => !!val) as MahjongTile[][];

    return discardables.flat(1);
  }

  public static readonly isNormalForm = false;
  public static readonly closedOnly = true;
  public static readonly yakuName = YAKU.SEVEN_PAIRS;
}

export default SevenPairs;
