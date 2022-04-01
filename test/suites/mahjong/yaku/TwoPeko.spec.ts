import { expect } from "chai";
import TwoPeko from "../../../../src/core/game/mahjong/yaku/TwoPeko";
import MahjongDragonGenerator from "../../../MahjongDragonGenerator";

describe("량페코", () => {
  const generator = new MahjongDragonGenerator();

  afterEach(() => {
    generator.reset();
  });

  it("량페코 - 3판", () => {
    const hands = [
      "만1", "만2", "만3",
      "만1", "만2", "만3",
      "통3", "통4", "통5",
      "통3", "통4", "통5",
      "만4", "만4"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = TwoPeko.check(dragon);

    expect(score).to.equal(3);
  });

  it("량페코가 아닌 케이스 (1)", () => {
    const hands = [
      "만1", "만2", "만3",
      "만1", "만2", "만3",
      "통3", "통4", "통5",
      "삭3", "삭4", "삭5",
      "중", "중"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = TwoPeko.check(dragon);

    expect(score).to.equal(0);
  });
});
