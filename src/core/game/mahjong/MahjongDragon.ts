import MahjongPlayer from "./MahjongPlayer";
import MahjongTile from "./MahjongTile";

interface MahjongDragon {
  head: MahjongTile[][];
  body: Array<{
    type: number;
    borrowed: boolean;
    tiles: MahjongTile[];
  }>;
  tiles: MahjongTile[];
  player: MahjongPlayer;
  cried: boolean;
  lastTile: {
    tile: MahjongTile;
    isTsumo: boolean;
    isAdditiveKang: boolean;
  };
}

export default MahjongDragon;
