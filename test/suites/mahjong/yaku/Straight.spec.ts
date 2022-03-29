import { expect } from "chai";
import Straight from "../../../../src/core/game/mahjong/yaku/Straight";
import MahjongDragonGenerator from "../../../MahjongDragonGenerator";

describe("일기통관", () => {
  const generator = new MahjongDragonGenerator();

  afterEach(() => {
    generator.reset();
  });

  it("일기통관 - 2판", () => {
    const hands = [
      "만1", "만2", "만3",
      "만4", "만5", "만6",
      "만7", "만8", "만9",
      "삭7", "삭7", "삭7",
      "만1", "만1"
    ];
    const dragon = generator.dragonBystring(hands, 13);
    const score = Straight.check(dragon);

    expect(score).to.equal(2);
  });

  it("일기통관 - 2판 (2)", () => {
    const hands = [
      "만1", "만2", "만3",
      "만4", "만5", "만6",
      "만7", "만8", "만9",
      "만2", "만3", "만4",
      "만1", "만1"
    ];
    const dragon = generator.dragonBystring(hands, 13);
    const score = Straight.check(dragon);

    expect(score).to.equal(2);
  });

  it("일기통관이 아닌 케이스 (1)", () => {
    const hands = [
      "만1", "만2", "만3",
      "만4", "만5", "만6",
      "삭7", "삭8", "삭9",
      "삭7", "삭7", "삭7",
      "만1", "만1"
    ];
    const dragon = generator.dragonBystring(hands, 13);
    const score = Straight.check(dragon);

    expect(score).to.equal(0);
  });

  it("일기통관이 아닌 케이스 (2)", () => {
    const hands = [
      "만1", "만1", "만2",
      "만2", "만2", "만3",
      "만4", "만5", "만6",
      "만7", "만8", "만9",
      "만9", "만9"
    ];
    const dragon = generator.dragonBystring(hands, 13);
    const score = Straight.check(dragon);

    expect(score).to.equal(0);
  });
});
