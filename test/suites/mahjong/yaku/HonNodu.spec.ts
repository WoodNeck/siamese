import { expect } from "chai";
import HonNodu from "../../../../src/core/game/mahjong/yaku/HonNodu";
import MahjongDragonGenerator from "../../../MahjongDragonGenerator";

describe("혼노두", () => {
  const generator = new MahjongDragonGenerator();

  afterEach(() => {
    generator.reset();
  });

  it("혼노두 - 2판", () => {
    const hands = [
      "만1", "만1", "만1",
      "통9", "통9", "통9",
      "동", "동", "동",
      "발", "발", "발",
      "삭1", "삭1"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = HonNodu.check(dragon);

    expect(score).to.equal(2);
  });

  it("혼노두가 아닌 경우 (1)", () => {
    const hands = [
      "만1", "만2", "만3",
      "만9", "만9", "만9",
      "백", "백", "백",
      "발", "발", "발",
      "만9", "만9"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = HonNodu.check(dragon);

    expect(score).to.equal(0);
  });
});
