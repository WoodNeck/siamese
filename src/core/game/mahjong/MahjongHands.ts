import MahjongTile from "./MahjongTile";
import MahjongSetInfo from "./MahjongSetInfo";

class MahjongHands {
  public holding: MahjongTile[];
  public borrows: Omit<MahjongSetInfo, "head">;
  public kang: MahjongTile[][];
  public discards: MahjongTile[];

  public get tiles() {
    return [
      ...this.holding,
      ...this.kang.flat(1),
      ...this.borrows.ordered.flat(1),
      ...this.borrows.same.flat(1),
      ...this.borrows.kang.flat(1)
    ];
  }

  public get cried() {
    return this.borrows.ordered.length > 0
      || this.borrows.same.length > 0
      || this.borrows.kang.length > 0;
  }

  public constructor() {
    this.reset();
  }

  public reset() {
    this.holding = [];
    this.kang = [];
    this.borrows = {
      ordered: [],
      same: [],
      kang: []
    };
    this.discards = [];
  }

  public add(tiles: MahjongTile[]) {
    this.holding.push(...tiles);
  }

  public play(index: number): MahjongTile {
    const tile = this.holding.splice(index, 1)[0];

    this.discards.push(tile);

    return tile;
  }
}

export default MahjongHands;
