import { toEmoji } from "~/util/helper";
import * as MAHJONG from "~/const/mahjong";

class MahjongTile {
  public readonly id: number;
  public readonly index: number;
  public readonly type: MAHJONG.TILE_TYPE;
  public readonly isRedDora: boolean;

  public get tileID() { return this.type * 9 + this.index; }

  public borrowed: boolean;
  public lent: boolean;

  public constructor({
    id,
    index,
    type,
    isRedDora
  }: {
    id: number;
    index: number; // index within type
    type: MAHJONG.TILE_TYPE; // type of the tile
    isRedDora: boolean;
  }) {
    this.id = id;
    this.index = index;
    this.type = type;
    this.isRedDora = isRedDora;

    this.isRedDora = false;
    this.borrowed = false;
    this.lent = false;
  }

  public getEmoji(): string {
    const type = this.type;
    const index = this.index;

    const emojiPool = this.borrowed
      ? MAHJONG.EMOJI_ROTATED
      : this.lent
        ? MAHJONG.EMOJI_GRAYSCALE
        : MAHJONG.EMOJI;

    const emoji = this.isRedDora
      ? emojiPool.DORA[type]
      : emojiPool[type][index];

    return toEmoji(emoji.name, emoji.id);
  }

  public borrow(): MahjongTile {
    const cloned = new MahjongTile({
      ...this
    });

    cloned.borrowed = true;
    this.lent = true;

    return cloned;
  }
}

export default MahjongTile;
