import MahjongDragon from "../MahjongDragon";
import MahjongGame from "../MahjongGame";

interface Yaku {
  closedOnly: boolean;
  yakuName: string;
  check(dragon: MahjongDragon, game: MahjongGame): number;
}

export default Yaku;
