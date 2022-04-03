import MahjongTile from "./MahjongTile";
import MahjongScoreInfo from "./MahjongScoreInfo";

interface MahjongPlayerAction {
  tiles: MahjongTile[];
  order: number;
  type: string;
  score?: MahjongScoreInfo;
}

export default MahjongPlayerAction;
