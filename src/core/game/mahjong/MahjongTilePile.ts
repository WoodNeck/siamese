import MahjongTile from "./MahjongTile";

import * as MAHJONG from "~/const/mahjong";
import { shuffle } from "~/util/helper";
import { TILE_TYPE } from "~/const/mahjong";

class MahjongTilePile {
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

  public drawByString(handsString: string[]) {
    const availableCharacters = [
      { char: "만", index: 0, offset: 0, type: TILE_TYPE.MAN },
      { char: "통", index: 9, offset: 0, type: TILE_TYPE.PIN },
      { char: "삭", index: 18, offset: 0, type: TILE_TYPE.SOU },
      { char: "동", index: 27, offset: 0, type: TILE_TYPE.KAZE },
      { char: "남", index: 27, offset: 1, type: TILE_TYPE.KAZE },
      { char: "서", index: 27, offset: 2, type: TILE_TYPE.KAZE },
      { char: "북", index: 37, offset: 3, type: TILE_TYPE.KAZE },
      { char: "백", index: 31, offset: 0, type: TILE_TYPE.SANGEN },
      { char: "발", index: 31, offset: 1, type: TILE_TYPE.SANGEN },
      { char: "중", index: 31, offset: 2, type: TILE_TYPE.SANGEN }
    ];
    const charMap = availableCharacters.map(val => val.char);

    return handsString.map(hand => {
      const charIdx = charMap.findIndex(char => char === hand[0]);
      const char = availableCharacters[charIdx];
      const num = ((parseFloat(hand[1]) - 1) || 0) + char.offset;

      const tileIdx = this._tiles.findIndex(tile => tile.type === char.type && tile.index === num);
      return this._tiles.splice(tileIdx, 1)[0];
    });
  }
}

export default MahjongTilePile;
