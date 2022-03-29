import MahjongTile from "./MahjongTile";

export interface MahjongSet {
  tiles: MahjongTile[];
  type: number;
  borrowed: boolean;
}

interface MahjongSetInfo {
  head: MahjongSet[];
  ordered: MahjongSet[];
  same: MahjongSet[];
  kang: MahjongSet[];
}

export default MahjongSetInfo;
