import { expect } from "chai";
import { BODY_TYPE } from "../../../../src/const/mahjong";
import MahjongHandsParser from "../../../../src/core/game/mahjong/MahjongHandsParser";
import OnePeko from "../../../../src/core/game/mahjong/yaku/OnePeko";
import MahjongDragonGenerator from "../../../MahjongDragonGenerator";

describe("이페코", () => {
  const generator = new MahjongDragonGenerator();

  afterEach(() => {
    generator.reset();
  });

  it("이페코 - 1판", () => {
    const hands = [
      "만1", "만2", "만3",
      "만1", "만2", "만3",
      "통3", "통4", "통5",
      "삭3", "삭4", "삭5",
      "중", "중"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = OnePeko.check(dragon);

    expect(score).to.equal(1);
  });

  it("이페코 - 0판", () => {
    const hands = generator.handsByString([
      "만2", "만3", "만4", "통7", "통8", "통9", "백", "백", "통8", "통9"
    ]);
    hands.addBorrowedTileSet(generator.tileSetByString(["통1", "통2", "통3"], BODY_TYPE.ORDERED, true));

    const handsParser = new MahjongHandsParser();
    const scoreInfo = handsParser.getScoreInfo(
      hands.holding,
      hands.borrows,
      [],
      generator.game,
      generator.player,
      {
        tile: generator.tilesByString(["통7"])[0],
        isTsumo: false,
        isAdditiveKang: false
      }
    );

    expect(scoreInfo).to.be.null;
  });


  it("이페코가 아닌 케이스 (1)", () => {
    const hands = [
      "만1", "만2", "만3",
      "만2", "만3", "만4",
      "통2", "통3", "통4",
      "삭2", "삭3", "삭4",
      "중", "중"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = OnePeko.check(dragon);

    expect(score).to.equal(0);
  });

  it("이페코가 아닌 케이스 (2)", () => {
    // 량페코 손패
    const hands = [
      "만1", "만2", "만3",
      "만1", "만2", "만3",
      "통3", "통4", "통5",
      "통3", "통4", "통5",
      "만4", "만4"
    ];
    const dragon = generator.dragonBystring(hands);
    const score = OnePeko.check(dragon);

    expect(score).to.equal(0);
  });
});
