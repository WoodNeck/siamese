import MahjongDragon from "../src/core/game/mahjong/MahjongDragon";
import MahjongTile from "../src/core/game/mahjong/MahjongTile";
import { TILE_TYPE, WIND } from "../src/const/mahjong";
import MahjongHands from "../src/core/game/mahjong/MahjongHands";
import MahjongSetParser from "../src/core/game/mahjong/MahjongSetParser";
import MahjongGame from "../src/core/game/mahjong/MahjongGame";

import MahjongPlayerMock from "./MahjongPlayerMock";

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

class MahjongDragonGenerator {
  public game = new MahjongGame([], null as any);
  public parser = new MahjongSetParser();
  public hands = new MahjongHands(new MahjongPlayerMock());

  public reset(): void {
    this.hands.reset();
    this.game.startNewRound(true);
    this.game.wind = WIND.EAST;
  }

  public handsByString(handStrings: string[]): MahjongHands {
    const charMap = availableCharacters.map(val => val.char);

    handStrings.forEach(hand => {
      if (!charMap.includes(hand[0])) {
        throw new Error(`${hand} is not an available character`);
      }
    });

    const duplications = new Map<string, number>();
    const tiles = handStrings
      .map(hand => {
        const tile = this._toTile(hand, duplications);

        (tile as any).name = hand;

        return tile;
      }).sort((a, b) => a.id - b.id);

    this.hands.add(tiles);

    return this.hands;
  }

  public dragonBystring(handStrings: string[], lastTileIdx: number, { isTsumo = true, isAdditiveKang = false }: Partial<Omit<MahjongDragon["lastTile"], "tile">> = {}): MahjongDragon {
    const { game, parser, hands } = this;
    const charMap = availableCharacters.map(val => val.char);

    handStrings.forEach(hand => {
      if (!charMap.includes(hand[0])) {
        throw new Error(`${hand} is not an available character`);
      }
    });

    const duplications = new Map<string, number>();

    const tiles = handStrings
      .map(hand => {
        const tile = this._toTile(hand, duplications);

        (tile as any).name = hand;

        return tile;
      })
      .sort((a, b) => a.id - b.id);

    hands.add(tiles);

    const set = parser.parse(hands);

    const result = parser.parseFinished(hands, set, game, {
      tile: tiles[lastTileIdx],
      isTsumo,
      isAdditiveKang
    });

    if (!result) {
      throw new Error("Can't create dragon");
    }

    return result.dragon;
  }

  private _toTile(hand: string, duplications: Map<string, number>) {
    const charMap = availableCharacters.map(val => val.char);
    const charIdx = charMap.findIndex(char => char === hand[0]);
    const char = availableCharacters[charIdx];
    const num = ((parseFloat(hand[1]) - 1) || 0) + char.offset;

    const key = `${char.char}${num}`;
    if (!duplications.has(key)) duplications.set(key, 0);

    const duplicationCount = duplications.get(key) as number;

    const tile = new MahjongTile({
      id: 4 * (char.index + num) + duplicationCount,
      index: num,
      type: char.type,
      isRedDora: /적/.test(hand)
    });

    duplications.set(key, duplicationCount + 1);

    return tile;
  }
}

export default MahjongDragonGenerator;
