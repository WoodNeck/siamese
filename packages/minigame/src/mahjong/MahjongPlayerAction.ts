import MahjongScoreInfo from "./MahjongScoreInfo";
import MahjongTile from "./MahjongTile";

interface MahjongPlayerAction {
  tiles: MahjongTile[];
  order: number;
  type: string;
  score?: MahjongScoreInfo;
}

export type { MahjongPlayerAction };
