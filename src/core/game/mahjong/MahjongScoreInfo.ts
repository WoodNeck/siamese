import MahjongDragon from "./MahjongDragon";
import Yaku from "./yaku/Yaku";

interface MahjongScoreInfo {
  dragon: MahjongDragon;
  scores: Array<{ yaku: Yaku; score: number }>;
  subscore: number;
}

export default MahjongScoreInfo;
