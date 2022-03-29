import MahjongTile from "./MahjongTile";

import * as MAHJONG from "~/const/mahjong";
import { shuffle } from "~/util/helper";

class MahjongTiles {
  private _tiles: MahjongTile[];

  public get tiles() { return this._tiles; }
  public get left() { return this._tiles.length; }

  public constructor() {
    const datas = [
      ...MAHJONG.DATA.MAN,
      ...MAHJONG.DATA.PIN,
      ...MAHJONG.DATA.SOU,
      ...MAHJONG.DATA.KAZE,
      ...MAHJONG.DATA.SANGEN
    ];

    const tiles: MahjongTile[] = new Array(4 * datas.length);

    datas.forEach((data, idx) => {
      for (let i = 0; i < 4; i++) {
        const index = 4 * idx + i;
        const isRedDora = i === 0 && (idx === 4 || idx === 13 || idx === 22);

        tiles[index] = new MahjongTile({
          id: index,
          index: data.index,
          type: data.type,
          isRedDora
        });
      }
    });

    this._tiles = shuffle(tiles);
  }

  public draw(count: number) {
    return this._tiles.splice(0, count);
  }
}

export default MahjongTiles;
