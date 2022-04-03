import { expect } from "chai";
import Flush from "../../../../src/core/game/mahjong/yaku/Flush";
import MahjongDragonGenerator from "../../../MahjongDragonGenerator";

describe("청일색", () => {
  const generator = new MahjongDragonGenerator();

  afterEach(() => {
    generator.reset();
  });

  it("청일색 - 6판", () => {
    const hands = [
      "만1", "만2", "만3",
      "만4", "만5", "만6",
      "만4", "만5", "만6",
      "만7", "만8", "만9",
      "만1", "만1"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = Flush.check(dragon);

    expect(score).to.equal(6);
  });

  it("청일색이 아닌 케이스 (1)", () => {
    const hands = [
      "만1", "만2", "만3",
      "만4", "만5", "만6",
      "만7", "만8", "만9",
      "동", "동", "동",
      "만1", "만1"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = Flush.check(dragon);

    expect(score).to.equal(0);
  });

  it("청일색이 아닌 케이스 (2)", () => {
    const hands = [
      "만1", "만2", "만3",
      "만4", "만5", "만6",
      "만7", "만8", "만9",
      "만4", "만5", "만6",
      "삭1", "삭1"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = Flush.check(dragon);

    expect(score).to.equal(0);
  });

  it("청일색이 아닌 케이스 (3)", () => {
    // 자일색 손패
    const hands = [
      "북", "북", "북",
      "서", "서", "서",
      "남", "남", "남",
      "동", "동", "동",
      "백", "백"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = Flush.check(dragon);

    expect(score).to.equal(0);
  });
});
