import MahjongTile from "./MahjongTile";

interface MahjongSetInfo {
  head: MahjongTile[][];
  ordered: MahjongTile[][];
  same: MahjongTile[][];
  kang: MahjongTile[][];
}

export default MahjongSetInfo;
