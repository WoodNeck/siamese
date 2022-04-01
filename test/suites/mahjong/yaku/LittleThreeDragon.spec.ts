import { expect } from "chai";
import LittleThreeDragon from "../../../../src/core/game/mahjong/yaku/LittleThreeDragon";
import MahjongDragonGenerator from "../../../MahjongDragonGenerator";

describe("소삼원", () => {
  const generator = new MahjongDragonGenerator();

  afterEach(() => {
    generator.reset();
  });

  it("소삼원 - 2판", () => {
    const hands = [
      "만1", "만2", "만3",
      "만7", "만8", "만9",
      "백", "백", "백",
      "발", "발", "발",
      "중", "중"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = LittleThreeDragon.check(dragon);

    expect(score).to.equal(2);
  });

  it("소삼원이 아닌 경우 (1)", () => {
    const hands = [
      "만1", "만2", "만3",
      "만7", "만8", "만9",
      "백", "백", "백",
      "발", "발", "발",
      "만8", "만8"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = LittleThreeDragon.check(dragon);

    expect(score).to.equal(0);
  });

  it("소삼원이 아닌 경우 (2)", () => {
    const hands = [
      "만1", "만2", "만3",
      "만7", "만8", "만9",
      "삭1", "삭1", "삭1",
      "발", "발", "발",
      "중", "중"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = LittleThreeDragon.check(dragon);

    expect(score).to.equal(0);
  });
});
