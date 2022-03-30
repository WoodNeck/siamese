import { expect } from "chai";
import MahjongDragonGenerator from "../../MahjongDragonGenerator";

describe("MahjongHands", () => {
  const generator = new MahjongDragonGenerator();

  afterEach(() => {
    generator.reset();
  });

  describe("isRiichiable", () => {
    it("TC 1", () => {
      const tiles = [
        "만3", "만5", "만6",
        "만9", "만9", "만9",
        "통5", "통6", "통7",
        "삭6", "삭8", "중",
        "중", "만7"
      ];

      const hands = generator.handsByString(tiles);

      expect(hands.isRiichiable()).to.be.false;
    })
  });
});
