import MahjongGame from "./MahjongGame";
import MahjongHands from "./MahjongHands";
import MahjongSetInfo, { MahjongSet } from "./MahjongSetInfo";
import MahjongTile from "./MahjongTile";
import MahjongDragon from "./MahjongDragon";
import Yaku from "./yaku/Yaku";
import { YAKU_LIST } from "./yaku";
import ThirteenOrphans from "./yaku/ThirteenOrphans";
import SevenPairs from "./yaku/SevenPairs";

import * as MAHJONG from "~/const/mahjong";
import { pick } from "~/util/helper";

class MahjongSetParser {
  public parse(hands: MahjongHands): MahjongSetInfo {
    const head: MahjongSet[] = [];
    const ordered: MahjongSet[] = [];
    const same: MahjongSet[] = [];
    const kang: MahjongSet[] = [];

    const group = this._groupTilesByType(hands.holding);

    Object.keys(group).forEach(type => {
      const groupByType = group[type];

      head.push(...this._findSameByCount(groupByType, 2).map(tiles => ({ tiles, type: -1, borrowed: false })));
      same.push(...this._findSameByCount(groupByType, 3).map(tiles => ({ tiles, type: MAHJONG.BODY_TYPE.SAME, borrowed: false })));
      ordered.push(...this._findOrderedByCount(parseFloat(type), groupByType, 3).map(tiles => ({ tiles, type: MAHJONG.BODY_TYPE.ORDERED, borrowed: false })));
    });

    ordered.push(...hands.borrows.ordered.map(tiles => ({ tiles, type: MAHJONG.BODY_TYPE.ORDERED, borrowed: true })));
    same.push(...hands.borrows.same.map(tiles => ({ tiles, type: MAHJONG.BODY_TYPE.SAME, borrowed: true })));
    kang.push(
      ...hands.kang.map(tiles => ({ tiles, type: MAHJONG.BODY_TYPE.KANG, borrowed: false })),
      ...hands.borrows.kang.map(tiles => ({ tiles, type: MAHJONG.BODY_TYPE.KANG, borrowed: true }))
    );

    return {
      head,
      ordered,
      same,
      kang
    };
  }

  public parseCandidates(hands: MahjongHands): {
    ordered: MahjongTile[][];
    same: MahjongTile[][];
    kang: MahjongTile[][];
  } {
    const ordered: MahjongTile[][] = [];
    const same: MahjongTile[][] = [];
    const kang: MahjongTile[][] = [];

    const group = this._groupTilesByType(hands.holding);
    Object.keys(group).forEach(type => {
      const groupByType = group[type];

      same.push(...this._findSameByCount(groupByType, 2));
      kang.push(...this._findSameByCount(groupByType, 3));
      ordered.push(...this._findOrderedByCount(parseFloat(type), groupByType, 2));
    });

    kang.push(...hands.borrows.same);

    return {
      ordered,
      same,
      kang
    };
  }

  public parseFinished(
    hands: MahjongHands,
    set: MahjongSetInfo,
    game: MahjongGame,
    lastTile: MahjongDragon["lastTile"],
  ): { dragon: MahjongDragon; scores: Array<{ yaku: Yaku; score: number }> } | null {
    const tiles = hands.tiles;

    if (ThirteenOrphans.checkByHands(hands)) {
      return {
        dragon: {
          head: [],
          body: [],
          lastTile,
          hands,
          tiles
        },
        scores: [{
          yaku: ThirteenOrphans,
          score: ThirteenOrphans.score
        }]
      };
    }

    const headAndBodys = this._getDragonHeadAndBody(set);
    if (headAndBodys.length <= 0) return null;

    const dragons = headAndBodys.map(headAndBody => {
      return { head: headAndBody.head, body: headAndBody.body, tiles, lastTile, hands };
    });
    const scores = dragons.map(dragon => this._getScore(dragon, hands, game));
    const totalScores = scores.map(scoreArr => {
      return scoreArr.reduce((total, { score }) => {
        return total + score;
      }, 0);
    });

    let bestScoreIdx = 0;
    totalScores.forEach((score, idx) => {
      if (score > totalScores[bestScoreIdx]) bestScoreIdx = idx;
    });

    return {
      dragon: dragons[bestScoreIdx],
      scores: scores[bestScoreIdx]
    };
  }

  private _getScore(dragon: MahjongDragon, hands: MahjongHands, game: MahjongGame): Array<{
    score: number;
    yaku: Yaku;
  }> {
    const cried = hands.cried;
    const yakus: Array<{ score: number; yaku: Yaku }> = [];

    YAKU_LIST.forEach(yaku => {
      if (yaku.closedOnly && cried) return;
      if (yaku.isNormalForm && (dragon.head.length !== 1 || dragon.body.length !== 4)) return;
      const score = yaku.check(dragon, game);

      if (score > 0) {
        yakus.push({ score, yaku });
      }
    });

    return yakus;
  }

  private _groupTilesByType(tiles: MahjongTile[]): Record<number, MahjongTile[]> {
    const group = Object.values(MAHJONG.TILE_TYPE).reduce((result, type) => {
      result[type] = [];
      return result;
    }, {} as Record<number, MahjongTile[]>);

    tiles.forEach(tile => {
      group[tile.type].push(tile);
    });

    // Sort tiles
    Object.values(group).forEach(groupArr => {
      groupArr.sort((a, b) => a.id - b.id);
    });

    return group;
  }

  private _findSameByCount(group: MahjongTile[], count: number): MahjongTile[][] {
    const combinations = pick(group, count);

    return combinations.filter(comb => {
      return comb.every((tile, idx) => {
        if (idx === 0) return true;
        const prevTile = comb[idx - 1];
        return tile.index === prevTile.index && tile.type === prevTile.type;
      });
    });
  }

  private _findOrderedByCount(type: number, group: MahjongTile[], count: number): MahjongTile[][] {
    const orderTypes = [MAHJONG.TILE_TYPE.MAN, MAHJONG.TILE_TYPE.PIN, MAHJONG.TILE_TYPE.SOU] as number[];
    if (!orderTypes.includes(type)) return [];

    const combinations = pick(group, count);

    return combinations.filter(combination => {
      return combination.every((tile, idx) => {
        if (idx === 0) return true;
        const prev = combination[idx - 1];
        return tile.index === prev.index + 1;
      });
    });
  }

  private _getDragonHeadAndBody(set: MahjongSetInfo): Array<{
    head: MahjongTile[][];
    body: Array<{
      tiles: MahjongTile[];
      borrowed: boolean;
      type: number;
    }>;
  }> {
    const { head, ordered, same, kang } = set;

    const bodies = [
      ...ordered.map(info => ({ ...info, type: MAHJONG.BODY_TYPE.ORDERED })),
      ...same.map(info => ({ ...info, type: MAHJONG.BODY_TYPE.SAME })),
      ...kang.map(info => ({ ...info, type: MAHJONG.BODY_TYPE.KANG }))
    ];

    const combinations = pick(bodies, 4);
    const correctCombinations = combinations.map(combination => {
      const allTiles = combination.reduce((total, { tiles }) => [...total, ...tiles], []);

      const tileSet = new Set(allTiles.map(tile => tile.id));
      const hasDuplication = tileSet.size < allTiles.length;

      if (!hasDuplication) {
        const actualHead = head.find(piece => piece.tiles.every(tile => !tileSet.has(tile.id)));

        if (actualHead) {
          return {
            head: [actualHead.tiles],
            body: combination
          };
        }
      }

      return null;
    }).filter(val => !!val) as Array<{
      head: MahjongTile[][];
      body: Array<{
        tiles: MahjongTile[];
        borrowed: boolean;
        type: number;
      }>;
    }>;

    if (head.length >= 7) {
      const sevenPairs = SevenPairs.checkBySet(set).map(heads => ({
        head: heads,
        body: [] as Array<{
          tiles: MahjongTile[];
          borrowed: boolean;
          type: number;
        }>
      }));

      correctCombinations.push(...sevenPairs);
    }

    return correctCombinations;
  }
}

export default MahjongSetParser;
