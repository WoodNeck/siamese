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
    const success = ThirteenOrphans.checkByTiles(generator.tilesByString(tiles));

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
    const success = ThirteenOrphans.checkByTiles(generator.tilesByString(tiles));

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
    const success = ThirteenOrphans.checkByTiles(generator.tilesByString(tiles));

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
    const success = ThirteenOrphans.checkByTiles(generator.tilesByString(tiles));

    expect(success).to.be.false;
  });

  describe("getTenpaiCandidates", () => {
    it("13면팅", () => {
      const tiles = generator.tilesByString([
        "만1", "만9",
        "삭1", "삭9",
        "통1", "통9",
        "동", "남", "서", "북",
        "백", "발", "중"
      ]);

      const candidates = ThirteenOrphans.getTenpaiCandidates(tiles).sort((a, b) => a - b);

      expect(candidates).to.deep.equal(tiles.map(tile => tile.tileID).sort((a, b) => a - b));
    });

    it("13면팅 (2)", () => {
      const tiles = generator.tilesByString([
        "만1", "만9",
        "삭1", "삭9",
        "통1", "통9",
        "동", "남", "서", "북",
        "백", "발", "중", "중"
      ]);

      const candidates = ThirteenOrphans.getTenpaiCandidates(tiles).sort((a, b) => a - b);
      const tileIDSet = new Set(tiles.map(tile => tile.tileID).sort((a, b) => a - b));

      expect(candidates).to.deep.equal([...tileIDSet.values()]);
    });

    it("텐파이", () => {
      const tiles = generator.tilesByString([
        "만1", "만9",
        "삭1", "삭9",
        "통1", "통9",
        "동", "남", "서", "북",
        "백", "발", "발"
      ]);
      const left = generator.tilesByString(["중"]);
      const candidates = ThirteenOrphans.getTenpaiCandidates(tiles);

      expect(candidates).to.deep.equal(left.map(tile => tile.tileID));
    });

    it("노텐", () => {
      const tiles = generator.tilesByString([
        "만1", "만9",
        "삭1", "삭9",
        "통1", "통9",
        "동", "남", "서", "북",
        "백", "발", "삭5"
      ]);
      const candidates = ThirteenOrphans.getTenpaiCandidates(tiles);

      expect(candidates.length).to.equal(0);
    });
  });
});
