import { expect } from "chai";
import ThreeColorStraight from "../../../../src/core/game/mahjong/yaku/ThreeColorStraight";
import MahjongDragonGenerator from "../../../MahjongDragonGenerator";

describe("삼색동순", () => {
  const generator = new MahjongDragonGenerator();

  afterEach(() => {
    generator.reset();
  });

  it("삼색동순 - 2판", () => {
    const hands = [
      "만1", "만2", "만3",
      "삭1", "삭2", "삭3",
      "통1", "통2", "통3",
      "삭7", "삭7", "삭7",
      "만1", "만1"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = ThreeColorStraight.check(dragon);

    expect(score).to.equal(2);
  });

  it("삼색동순 - 2판 (2)", () => {
    const hands = [
      "만4", "만5", "만6",
      "삭4", "삭5", "삭6",
      "통4", "통6", "통5",
      "삭5", "삭6", "삭7",
      "만1", "만1"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = ThreeColorStraight.check(dragon);

    expect(score).to.equal(2);
  });

  it("삼색동순이 아닌 케이스", () => {
    const hands = [
      "만4", "만5", "만6",
      "삭4", "삭5", "삭6",
      "통5", "통6", "통7",
      "삭5", "삭6", "삭7",
      "동", "동"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = ThreeColorStraight.check(dragon);

    expect(score).to.equal(0);
  });

  it("삼색동순이 아닌 케이스 (2)", () => {
    const hands = [
      "만4", "만5", "만6",
      "삭4", "삭5", "삭6",
      "삭4", "삭5", "삭6",
      "삭5", "삭6", "삭7",
      "동", "동"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = ThreeColorStraight.check(dragon);

    expect(score).to.equal(0);
  });
});
