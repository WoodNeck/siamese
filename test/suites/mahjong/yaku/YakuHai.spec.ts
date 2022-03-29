import { expect } from "chai";
import { WIND } from "../../../../src/const/mahjong";
import YakuHai from "../../../../src/core/game/mahjong/yaku/YakuHai";
import MahjongDragonGenerator from "../../../MahjongDragonGenerator";

describe("역패", () => {
  const generator = new MahjongDragonGenerator();

  afterEach(() => {
    generator.reset();
  });

  it("백 - 1판", () => {
    const hands = [
      "삭1", "삭1",
      "만1", "만2", "만3",
      "만1", "만2", "만3",
      "만4", "만5", "만6",
      "백", "백", "백"
    ];
    const dragon = generator.dragonBystring(hands, 13);
    const score = YakuHai.check(dragon, generator.game);

    expect(score).to.equal(1);
  });

  it("중 - 1판", () => {
    const hands = [
      "통4", "통4",
      "중", "중", "중",
      "남", "남", "남",
      "삭1", "삭2", "삭3",
      "삭4", "삭5", "삭6"
    ];
    const dragon = generator.dragonBystring(hands, 13);

    const score = YakuHai.check(dragon, generator.game);

    expect(score).to.equal(1);
  });

  it("발 - 1판", () => {
    const hands = [
      "통4", "통4",
      "발", "발", "발",
      "북", "북", "북",
      "삭1", "삭2", "삭3",
      "삭4", "삭5", "삭6"
    ];
    const dragon = generator.dragonBystring(hands, 13);

    const score = YakuHai.check(dragon, generator.game);

    expect(score).to.equal(1);
  });

  it("더블 동 - 2판", () => {
    const hands = [
      "삭9", "삭9",
      "동", "동", "동",
      "만1", "만2", "만3",
      "통1", "통2", "통3",
      "삭4", "삭5", "삭6"
    ];
    const dragon = generator.dragonBystring(hands, 13);

    const score = YakuHai.check(dragon, generator.game);

    expect(score).to.equal(2);
  });

  it("동(자풍패) - 1판", () => {
    const hands = [
      "삭9", "삭9",
      "동", "동", "동",
      "만1", "만2", "만3",
      "통1", "통2", "통3",
      "삭4", "삭5", "삭6"
    ];
    const dragon = generator.dragonBystring(hands, 13);
    generator.game.wind = WIND.SOUTH;

    const score = YakuHai.check(dragon, generator.game);

    expect(score).to.equal(1);
  });

  it("동(장풍패) - 1판", () => {
    const hands = [
      "삭9", "삭9",
      "동", "동", "동",
      "만1", "만2", "만3",
      "통1", "통2", "통3",
      "삭4", "삭5", "삭6"
    ];
    const dragon = generator.dragonBystring(hands, 13);
    dragon.hands.player.wind = WIND.SOUTH;

    const score = YakuHai.check(dragon, generator.game);

    expect(score).to.equal(1);
  });

  it("남(자풍패) - 1판", () => {
    const hands = [
      "삭9", "삭9",
      "남", "남", "남",
      "만1", "만2", "만3",
      "통1", "통2", "통3",
      "삭4", "삭5", "삭6"
    ];
    const dragon = generator.dragonBystring(hands, 13);
    dragon.hands.player.wind = WIND.SOUTH;

    const score = YakuHai.check(dragon, generator.game);

    expect(score).to.equal(1);
  });

  it("서(자풍패) - 1판", () => {
    const hands = [
      "삭9", "삭9",
      "서", "서", "서",
      "만1", "만2", "만3",
      "통1", "통2", "통3",
      "삭4", "삭5", "삭6"
    ];
    const dragon = generator.dragonBystring(hands, 13);
    dragon.hands.player.wind = WIND.WEST;

    const score = YakuHai.check(dragon, generator.game);

    expect(score).to.equal(1);
  });

  it("북(자풍패) - 1판", () => {
    const hands = [
      "삭9", "삭9",
      "북", "북", "북",
      "만1", "만2", "만3",
      "통1", "통2", "통3",
      "삭4", "삭5", "삭6"
    ];
    const dragon = generator.dragonBystring(hands, 13);
    dragon.hands.player.wind = WIND.NORTH;

    const score = YakuHai.check(dragon, generator.game);

    expect(score).to.equal(1);
  });

  it("비교군", () => {
    const hands = [
      "삭1", "삭1",
      "만1", "만2", "만3",
      "만1", "만2", "만3",
      "만4", "만5", "만6",
      "만7", "만8", "만9"
    ];
    const dragon = generator.dragonBystring(hands, 13);
    const score = YakuHai.check(dragon, generator.game);

    expect(score).to.equal(0);
  })
});
