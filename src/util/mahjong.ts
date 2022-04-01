import MahjongTile from "~/core/game/mahjong/MahjongTile";
import * as MAHJONG from "~/const/mahjong";

export const isYaoChu = (tile: MahjongTile): boolean => {
  if (
    tile.type === MAHJONG.TILE_TYPE.SANGEN
    || tile.type === MAHJONG.TILE_TYPE.KAZE
  ) {
    return true;
  } else {
    return tile.index === 0 || tile.index === 8;
  }
};
