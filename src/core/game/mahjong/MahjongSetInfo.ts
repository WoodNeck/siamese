import MahjongTileSet from "./MahjongTileSet";

interface MahjongSetInfo {
  head: MahjongTileSet[];
  ordered: MahjongTileSet[];
  same: MahjongTileSet[];
  kang: MahjongTileSet[];
}

export default MahjongSetInfo;
