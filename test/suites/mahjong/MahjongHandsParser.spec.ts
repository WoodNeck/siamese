import { expect } from "chai";
import MahjongDragonGenerator from "../../MahjongDragonGenerator";
import { BODY_TYPE } from "~/const/mahjong";
import MahjongHandsParser from "~/core/game/mahjong/MahjongHandsParser";

describe("MahjongHandsParser", () => {
  const generator = new MahjongDragonGenerator();

  afterEach(() => {
    generator.reset();
  });

  describe("getScoreInfo", () => {
    it("TC 1", () => {
      const hands = generator.handsByString([
        "만1", "만2", "만3", "만7"
      ]);
      hands.addBorrowedTileSet(
        generator.tileSetByString(["서", "서", "서"], BODY_TYPE.SAME, true)
      );
      hands.addBorrowedTileSet(
        generator.tileSetByString(["남", "남", "남"], BODY_TYPE.SAME, true)
      );
      hands.addBorrowedTileSet(
        generator.tileSetByString(["통7", "통8", "통9"], BODY_TYPE.ORDERED, true)
      );

      const handsParser = new MahjongHandsParser();
      const scoreInfo = handsParser.getScoreInfo(
        hands.holding,
        hands.borrows,
        [],
        generator.game,
        generator.player,
        {
          tile: generator.tilesByString(["만7"])[0],
          isTsumo: false,
          isAdditiveKang: false
        }
      );

      expect(scoreInfo).to.be.null;
    });
  });
});
