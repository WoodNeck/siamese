import MahjongDragon from "../MahjongDragon";

interface Yaku {
  closedOnly: boolean;
  yakuName: string;
  score: number;
  check(dragon: MahjongDragon, isTsumo: boolean): boolean;
}

export default Yaku;
