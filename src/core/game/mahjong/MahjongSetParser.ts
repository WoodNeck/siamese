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
  public static checkYaoChu(tile: MahjongTile) {
    if (
      tile.type === MAHJONG.TILE_TYPE.SANGEN
      || tile.type === MAHJONG.TILE_TYPE.KAZE
    ) {
      return true;
    } else {
      return tile.index === 0 || tile.index === 8;
    }
  }

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

    ordered.push(...hands.borrows.filter(({ type }) => type === MAHJONG.BODY_TYPE.ORDERED).map(val => ({ ...val, borrowed: true })));
    same.push(...hands.borrows.filter(({ type }) => type === MAHJONG.BODY_TYPE.SAME).map(val => ({ ...val, borrowed: true })));
    kang.push(
      ...hands.kang.map(tiles => ({ tiles, type: MAHJONG.BODY_TYPE.KANG, borrowed: false })),
      ...hands.borrows.filter(({ type }) => type === MAHJONG.BODY_TYPE.KANG).map(val => ({ ...val, borrowed: true }))
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

    kang.push(...hands.borrows.filter(({ type }) => type === MAHJONG.BODY_TYPE.SAME).map(({ tiles }) => tiles));

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
  ): {
      dragon: MahjongDragon;
      scores: Array<{ yaku: Yaku; score: number }>;
      subscore: number;
    } | null {
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
        }],
        subscore: 20
      };
    }

    const headAndBodys = this._getDragonHeadAndBody(set);
    if (headAndBodys.length <= 0) return null;

    const dragons = headAndBodys.map(headAndBody => {
      return { head: headAndBody.head, body: headAndBody.body, tiles, lastTile, hands };
    });
    const scores = dragons.map(dragon => this._getScore(dragon, hands, game));
    const subscores = dragons.map((dragon, idx) => this._getSubscore(dragon, hands, game, scores[idx]));
    const totalScores = scores.map(scoreArr => {
      return scoreArr.reduce((total, { score }) => {
        return total + score;
      }, 0);
    });

    let bestScoreIdx = 0;
    totalScores.forEach((score, idx) => {
      if (score > totalScores[bestScoreIdx]) bestScoreIdx = idx;
      else if (score === totalScores[bestScoreIdx]) {
        const subscore = subscores[idx];
        const bestSubScore = subscores[bestScoreIdx];

        if (subscore > bestSubScore) bestScoreIdx = idx;
      }
    });

    const finalScores = scores[bestScoreIdx];

    // 역만을 포함한 케이스
    if (finalScores.some(({ score }) => score >= 13)) {
      return {
        dragon: dragons[bestScoreIdx],
        scores: finalScores.filter(({ score }) => score >= 13), // 역만만 남김
        subscore: subscores[bestScoreIdx]
      };
    } else {
      return {
        dragon: dragons[bestScoreIdx],
        scores: finalScores,
        subscore: subscores[bestScoreIdx]
      };
    }
  }

  // 판수 계산
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

  // 부수 계산
  private _getSubscore(dragon: MahjongDragon, hands: MahjongHands, game: MahjongGame, scores: Array<{
    score: number;
    yaku: Yaku;
  }>): number {
    // 특수 케이스들
    const isSevenPairs = scores.filter(({ yaku }) => yaku.yakuName === MAHJONG.YAKU.SEVEN_PAIRS).length > 0;
    if (isSevenPairs) return 25;

    const pingHuMenzen = scores.filter(({ yaku }) => {
      return yaku.yakuName === MAHJONG.YAKU.PINGHU
        || yaku.yakuName === MAHJONG.YAKU.MENZEN_TSUMO;
    }).length === 2;
    if (pingHuMenzen) return 20;

    let score = 20;

    if (dragon.lastTile.isTsumo) {
      score += 2;
    } else if (!hands.cried) {
      score += 10;
    }

    score += this._getWaitingFormSubScore(dragon);
    score += this._getSameSubScore(dragon, hands, game);

    return this._ceilSubScore(score);
  }

  private _ceilSubScore(score: number): number {
    return Math.ceil(score / 10) * 10;
  }

  private _getWaitingFormSubScore(dragon: MahjongDragon): number {
    const lastTile = dragon.lastTile.tile;
    const { head, body } = dragon;

    if (head[0].findIndex(tile => tile.id === lastTile.id) >= 0) {
      return 2; // 머리 단기
    }

    const lastSet = body.find(({ tiles }) => {
      return tiles.findIndex(tile => tile.id === lastTile.id) >= 0;
    });

    if (!lastSet) return 0;

    const lastTwo = [...lastSet.tiles].splice(lastSet.tiles.findIndex(tile => tile.id === lastTile.id), 1);

    if (lastTwo.length !== 2) return 0;

    const tile1 = lastTwo[0];
    const tile2 = lastTwo[1];

    // 샤보
    if (tile1.index === tile2.index) return 0;
    // 간짱
    if (Math.abs(tile2.index - tile1.index) === 2) return 2;
    // 변짱
    if (lastTwo.some(tile => tile.index === 0) || lastTwo.some(tile => tile.index === 8)) return 2;

    return 0;
  }

  // 뚜이쯔 & 먼쯔 부수 계산
  private _getSameSubScore(dragon: MahjongDragon, hands: MahjongHands, game: MahjongGame): number {
    const { head, body } = dragon;
    const player = hands.player;

    let total = 0;

    const headTile = head[0][0];

    if (headTile.type === MAHJONG.TILE_TYPE.SANGEN) total += 2;
    if (headTile.type === MAHJONG.TILE_TYPE.KAZE) {
      if (headTile.index === player.getWind(game.wind)) total += 2;
      if (headTile.index === game.round.wind) total += 2;
    }

    body.forEach(set => {
      if (set.type === MAHJONG.BODY_TYPE.ORDERED) return;

      let score = 2;
      const tile = set.tiles[0];
      const isKang = set.type === MAHJONG.BODY_TYPE.KANG;
      const isYaoChu = MahjongSetParser.checkYaoChu(tile);
      const borrowed = set.borrowed;

      if (isKang) score *= 4;
      if (isYaoChu) score *= 2;
      if (!borrowed) score *= 2;

      total += score;
    });

    return total;
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
