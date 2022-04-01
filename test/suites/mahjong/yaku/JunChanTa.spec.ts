import { expect } from "chai";
import JunChanTa from "../../../../src/core/game/mahjong/yaku/JunChanTa";
import MahjongDragonGenerator from "../../../MahjongDragonGenerator";

describe("준찬타", () => {
  const generator = new MahjongDragonGenerator();

  afterEach(() => {
    generator.reset();
  });

  it("준찬타 - 3판", () => {
    const hands = [
      "만1", "만2", "만3",
      "만7", "만8", "만9",
      "통1", "통2", "통3",
      "삭1", "삭1", "삭1",
      "통9", "통9"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = JunChanTa.check(dragon);

    expect(score).to.equal(3);
  });

  it("준찬타가 아닌 케이스 (1)", () => {
    const hands = [
      "만1", "만1", "만1",
      "삭7", "삭8", "삭9",
      "백", "백", "백",
      "남", "남", "남",
      "중", "중"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = JunChanTa.check(dragon);

    expect(score).to.equal(0);
  });

  it("준찬타가 아닌 케이스 (2)", () => {
    const hands = [
      "만1", "만1", "만1",
      "삭7", "삭8", "삭9",
      "백", "백", "백",
      "통3", "통4", "통5",
      "중", "중"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = JunChanTa.check(dragon);

    expect(score).to.equal(0);
  });
});
