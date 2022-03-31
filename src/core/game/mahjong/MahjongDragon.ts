import MahjongHands from "./MahjongHands";
import MahjongTile from "./MahjongTile";

interface MahjongDragon {
  head: MahjongTile[][];
  body: Array<{
    type: number;
    borrowed: boolean;
    tiles: MahjongTile[];
  }>;
  tiles: MahjongTile[];
  hands: MahjongHands;
  lastTile: {
    tile: MahjongTile;
    isTsumo: boolean;
    isAdditiveKang: boolean;
  };
}

export default MahjongDragon;
