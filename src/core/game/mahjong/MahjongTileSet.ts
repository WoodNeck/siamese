import MahjongTile from "./MahjongTile";

import { BODY_TYPE } from "~/const/mahjong";

class MahjongTileSet {
  private _tiles: MahjongTile[];
  private _type: BODY_TYPE;
  private _borrowed: boolean;

  public get tiles() { return this._tiles; }
  public get type() { return this._type; }
  public get borrowed() { return this._borrowed; }

  public constructor({
    tiles,
    type,
    borrowed
  }: {
    tiles: MahjongTile[];
    type: BODY_TYPE;
    borrowed: boolean;
  }) {
    this._tiles = tiles;
    this._type = type;
    this._borrowed = borrowed;
  }
}

export default MahjongTileSet;
