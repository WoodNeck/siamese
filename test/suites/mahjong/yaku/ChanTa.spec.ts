import { expect } from "chai";
import ChanTa from "../../../../src/core/game/mahjong/yaku/ChanTa";
import MahjongDragonGenerator from "../../../MahjongDragonGenerator";

describe("찬타", () => {
  const generator = new MahjongDragonGenerator();

  afterEach(() => {
    generator.reset();
  });

  it("찬타 - 2판", () => {
    const hands = [
      "만1", "만2", "만3",
      "만7", "만8", "만9",
      "동", "동", "동",
      "삭1", "삭1", "삭1",
      "중", "중"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = ChanTa.check(dragon);

    expect(score).to.equal(2);
  });

  it("찬타 - 2판 (2)", () => {
    const hands = [
      "만1", "만1", "만1",
      "삭7", "삭8", "삭9",
      "백", "백", "백",
      "남", "남", "남",
      "중", "중"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = ChanTa.check(dragon);

    expect(score).to.equal(2);
  });

  it("찬타가 아닌 케이스", () => {
    const hands = [
      "만2", "만3", "만4",
      "삭7", "삭8", "삭9",
      "백", "백", "백",
      "남", "남", "남",
      "중", "중"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = ChanTa.check(dragon);

    expect(score).to.equal(0);
  });

  it("찬타가 아닌 케이스(2)", () => {
    const hands = [
      "만1", "만1", "만1",
      "삭7", "삭8", "삭9",
      "백", "백", "백",
      "통3", "통4", "통5",
      "중", "중"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = ChanTa.check(dragon);

    expect(score).to.equal(0);
  });
});
