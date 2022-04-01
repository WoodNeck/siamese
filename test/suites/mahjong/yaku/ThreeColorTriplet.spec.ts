import { expect } from "chai";
import ThreeColorTriplet from "../../../../src/core/game/mahjong/yaku/ThreeColorTriplet";
import MahjongDragonGenerator from "../../../MahjongDragonGenerator";

describe("삼색동각", () => {
  const generator = new MahjongDragonGenerator();

  afterEach(() => {
    generator.reset();
  });

  it("삼색동각 - 2판", () => {
    const hands = [
      "만1", "만1", "만1",
      "삭1", "삭1", "삭1",
      "통1", "통1", "통1",
      "삭4", "삭5", "삭6",
      "동", "동"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = ThreeColorTriplet.check(dragon);

    expect(score).to.equal(2);
  });

  it("삼색동순이 아닌 케이스", () => {
    const hands = [
      "만1", "만1", "만1",
      "삭4", "삭4", "삭4",
      "통1", "통1", "통1",
      "동", "동", "동",
      "백", "백"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = ThreeColorTriplet.check(dragon);

    expect(score).to.equal(0);
  });
});
