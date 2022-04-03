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

      expect(hands.isRiichiable()).to.be.true;
      expect(([...hands.handsInfo!.riichiDiscardables.values()][0] as any).name).equals("만3");
    })
  });

  describe("tenpai tiles", () => {
    it("TC 1", () => {
      const tiles = [
        "통2", "통4",
        "통6", "통7", "통8",
        "삭4", "삭5", "삭6",
        "백", "백", "백",
        "삭2", "삭2", "삭8"
      ];

      const hands = generator.handsByString(tiles);
      const pin3 = generator.tilesByString(["통3"])[0];
      const tenpaiTiles = [...hands.handsInfo!.tenpaiTiles.tiles];

      expect(tenpaiTiles.length).to.equal(1);
      expect(tenpaiTiles[0]).to.equal(pin3.tileID);
    });

    it("TC 2", () => {
      const tiles = [
        "통1", "통2",
        "통6", "통7", "통8",
        "삭4", "삭5", "삭6",
        "백", "백", "백",
        "삭2", "삭2", "삭8"
      ];

      const hands = generator.handsByString(tiles);
      const pin3 = generator.tilesByString(["통3"])[0];
      const tenpaiTiles = [...hands.handsInfo!.tenpaiTiles.tiles];

      expect(tenpaiTiles.length).to.equal(1);
      expect(tenpaiTiles[0]).to.equal(pin3.tileID);
    });

    it("TC 3", () => {
      const tiles = [
        "통8", "통9",
        "통6", "통7", "통8",
        "삭4", "삭5", "삭6",
        "백", "백", "백",
        "삭2", "삭2", "삭8"
      ];

      const hands = generator.handsByString(tiles);
      const pin3 = generator.tilesByString(["통7"])[0];
      const tenpaiTiles = [...hands.handsInfo!.tenpaiTiles.tiles];

      expect(tenpaiTiles.length).to.equal(1);
      expect(tenpaiTiles[0]).to.equal(pin3.tileID);
    });
  });
});
