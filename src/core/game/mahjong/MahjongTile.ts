import { toEmoji } from "~/util/helper";
import * as MAHJONG from "~/const/mahjong";

class MahjongTile {
  public readonly id: number;
  public readonly index: number;
  public readonly type: number;
  public readonly isRedDora: boolean;
  public readonly isLetter: boolean;

  public get tileID() { return this.type * 9 + this.index; }

  public borrowed: boolean;
  public lent: boolean;
  public isKangTile: boolean; // 왕패
  public closedKang: boolean; // 안깡 표시용

  public constructor({
    id,
    index,
    type,
    isRedDora
  }: {
    id: number;
    index: number; // index within type
    type: number; // type of the tile
    isRedDora: boolean;
  }) {
    this.id = id;
    this.index = index;
    this.type = type;
    this.isRedDora = isRedDora;
    this.isLetter = type === MAHJONG.TILE_TYPE.SANGEN || type === MAHJONG.TILE_TYPE.KAZE;

    this.borrowed = false;
    this.lent = false;
    this.isKangTile = false;
    this.closedKang = false;
  }

  public getEmoji(): string {
    const type = this.type;
    const index = this.index;

    const emojiPool = this.borrowed
      ? MAHJONG.EMOJI_ROTATED
      : this.lent
        ? MAHJONG.EMOJI_GRAYSCALE
        : MAHJONG.EMOJI;

    const emoji = this.closedKang
      ? MAHJONG.EMOJI.BACK
      : this.isRedDora
        ? emojiPool.DORA[type]
        : emojiPool[type][index];

    return toEmoji(emoji.name, emoji.id);
  }

  public getName(): string {
    return MAHJONG.NAME[this.type](this.index);
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
