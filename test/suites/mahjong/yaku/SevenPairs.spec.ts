import { expect } from "chai";
import SevenPairs from "../../../../src/core/game/mahjong/yaku/SevenPairs";
import MahjongDragonGenerator from "../../../MahjongDragonGenerator";

describe("치또이쯔", () => {
  const generator = new MahjongDragonGenerator();

  afterEach(() => {
    generator.reset();
  });

  it("치또이쯔 - 2판 (1)", () => {
    const hands = [
      "만1", "만1", "만2",
      "만2", "만4", "만4",
      "통3", "통3", "통8",
      "통8", "중", "중",
      "동", "동"
    ];
    const dragon = generator.dragonBystring(hands, 13);
    const score = SevenPairs.check(dragon);

    expect(score).to.equal(2);
  });

  it("치또이쯔가 아닌 케이스 (1)", () => {
    // 같은 패 4개는 인정 안함
    const hands = [
      "통1", "통2", "만3",
      "통1", "통2", "만3",
      "만3", "삭4", "삭5",
      "만3", "삭4", "삭5",
      "중", "중"
    ];

    expect(() => generator.dragonBystring(hands, 13)).to.throw("Can't create dragon");
  });

  it("치또이쯔가 아닌 케이스 (2)", () => {
    // 량페코 패는 치또이쯔 패인 경우로 간주되면 안됨
    const hands = [
      "만1", "만2", "만3",
      "만1", "만2", "만3",
      "통3", "통4", "통5",
      "통3", "통4", "통5",
      "중", "중"
    ];
    const dragon = generator.dragonBystring(hands, 13);
    const score = SevenPairs.check(dragon);

    expect(score).to.equal(0);
  });
});
