import MahjongTile from "./MahjongTile";

export interface MahjongSet {
  tiles: MahjongTile[];
  borrowed: boolean;
}

interface MahjongSetInfo {
  head: MahjongTile[][];
  ordered: MahjongSet[];
  same: MahjongSet[];
  kang: MahjongSet[];
}

export default MahjongSetInfo;
