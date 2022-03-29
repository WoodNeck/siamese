import { expect } from "chai";
import OnePeko from "../../../../src/core/game/mahjong/yaku/OnePeko";
import MahjongDragonGenerator from "../../../MahjongDragonGenerator";

describe("이페코", () => {
  const generator = new MahjongDragonGenerator();

  afterEach(() => {
    generator.reset();
  });

  it("이페코 - 1판", () => {
    const hands = [
      "만1", "만2", "만3",
      "만1", "만2", "만3",
      "통3", "통4", "통5",
      "삭3", "삭4", "삭5",
      "중", "중"
    ];
    const dragon = generator.dragonBystring(hands, 13);
    const score = OnePeko.check(dragon);

    expect(score).to.equal(1);
  });

  it("이페코가 아닌 케이스 (1)", () => {
    const hands = [
      "만1", "만2", "만3",
      "만2", "만3", "만4",
      "통2", "통3", "통4",
      "삭2", "삭3", "삭4",
      "중", "중"
    ];
    const dragon = generator.dragonBystring(hands, 13);
    const score = OnePeko.check(dragon);

    expect(score).to.equal(0);
  });

  it("이페코가 아닌 케이스 (2)", () => {
    // 량페코 손패
    const hands = [
      "만1", "만2", "만3",
      "만1", "만2", "만3",
      "통3", "통4", "통5",
      "통3", "통4", "통5",
      "만4", "만4"
    ];
    const dragon = generator.dragonBystring(hands, 13);
    const score = OnePeko.check(dragon);

    expect(score).to.equal(0);
  });
});
