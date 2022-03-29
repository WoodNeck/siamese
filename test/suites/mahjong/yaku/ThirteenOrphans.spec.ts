import { expect } from "chai";
import ThirteenOrphans from "../../../../src/core/game/mahjong/yaku/ThirteenOrphans";
import MahjongDragonGenerator from "../../../MahjongDragonGenerator";

describe("국사무쌍", () => {
  const generator = new MahjongDragonGenerator();

  afterEach(() => {
    generator.reset();
  });

  it("국사무쌍 - 올바른 케이스", () => {
    const tiles = [
      "만1", "만9",
      "삭1", "삭9",
      "통1", "통9",
      "동", "남", "서", "북",
      "백", "발", "중", "중"
    ];
    const hands = generator.handsByString(tiles);
    const success = ThirteenOrphans.checkByHands(hands);

    expect(success).to.be.true;
  });

  it("국사무쌍이 안되는 경우 1", () => {
    const tiles = [
      "만1", "만8",
      "삭1", "삭9",
      "통1", "통9",
      "동", "남", "서", "북",
      "백", "발", "중", "중"
    ];
    const hands = generator.handsByString(tiles);
    const success = ThirteenOrphans.checkByHands(hands);

    expect(success).to.be.false;
  });

  it("국사무쌍이 안되는 경우 2", () => {
    const tiles = [
      "만1", "만1",
      "삭1", "삭9",
      "통1", "통9",
      "동", "남", "서", "북",
      "백", "발", "중", "중"
    ];
    const hands = generator.handsByString(tiles);
    const success = ThirteenOrphans.checkByHands(hands);

    expect(success).to.be.false;
  });

  it("국사무쌍이 안되는 경우 3", () => {
    const tiles = [
      "만1", "만1",
      "삭1", "삭9",
      "통1", "통9",
      "동", "남", "서", "북",
      "백", "발", "중", "통5"
    ];
    const hands = generator.handsByString(tiles);
    const success = ThirteenOrphans.checkByHands(hands);

    expect(success).to.be.false;
  });
});
