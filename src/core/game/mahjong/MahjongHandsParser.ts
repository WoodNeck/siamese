import MahjongHands from "./MahjongHands";
import MahjongGame from "./MahjongGame";
import MahjongTile from "./MahjongTile";
import MahjongTileSet from "./MahjongTileSet";
import MahjongScoreInfo from "./MahjongScoreInfo";
import MahjongSetInfo from "./MahjongSetInfo";
import MahjongSetParser from "./MahjongSetParser";
import MahjongDragon from "./MahjongDragon";
import MahjongPlayer from "./MahjongPlayer";
import Yaku from "./yaku/Yaku";
import ThirteenOrphans from "./yaku/ThirteenOrphans";
import SevenPairs from "./yaku/SevenPairs";
import { YAKU_LIST } from "./yaku";

import { pick } from "~/util/helper";
import { BODY_TYPE, TILE_TYPE, YAKU } from "~/const/mahjong";
import { isYaoChu } from "~/util/mahjong";


export interface MahjongHandsInfo {
  // 현재 손패에 추가되면 날 수 있는 패 ID 목록
  tenpaiTiles: {
    tiles: Set<number>;
    isFuriten: boolean;
  };

  // 리치시 버릴 수 있는 패 목록
  riichiDiscardables: Set<MahjongTile>;

  // 현재 패로 났을 경우의 최대 점수 정보
  scoreInfo: MahjongScoreInfo | null;
}

interface ValidCombination {
  combination: MahjongTileSet[];
  leftover: MahjongTile[];
  hasHead: boolean;
  sevenPairCandidate: boolean;
}

class MahjongHandsParser {
  /**
   * 손패를 분석
   * @param hands 현재 손패
   * @param complete 현재 손패의 "개수"가 완성된(날 수 있는) 형태인지 여부
   */
  public parse(hands: MahjongHands, lastTile: MahjongDragon["lastTile"] | null): MahjongHandsInfo {
    const set = new MahjongSetParser().parse(hands.holding, hands.borrows, hands.kang);
    const validCombinations = this._getValidCombinations(hands.tiles, hands.cried, set);

    const tenpaiTiles = this._parseTenpaiInfo(hands, validCombinations);
    let riichiDiscardables = new Set<MahjongTile>();
    let scoreInfo: MahjongScoreInfo | null = null;

    if (lastTile) {
      // 완성형 패가 가능한 개수에 도달한 경우
      const isTenpai = tenpaiTiles.tiles.size > 0;

      riichiDiscardables = this._parseRiichiDiscardables(hands, isTenpai, validCombinations);
      scoreInfo = this._parseScoreInfo(hands.tiles, validCombinations, hands.game, hands.player, lastTile);
    }

    return {
      tenpaiTiles,
      riichiDiscardables,
      scoreInfo
    };
  }

  public getScoreInfo(holding: MahjongTile[], borrows: MahjongTileSet[], closedKang: MahjongTileSet[], game: MahjongGame, player: MahjongPlayer, lastTile: MahjongDragon["lastTile"]) {
    const holdingTiles = [...holding, lastTile.tile];

    const set = new MahjongSetParser().parse(holdingTiles, borrows, closedKang);
    const allTiles = [
      ...holdingTiles,
      ...closedKang.map(({ tiles }) => tiles).flat(1),
      ...borrows.map(({ tiles }) => tiles).flat(1)
    ];
    const validCombinations = this._getValidCombinations(allTiles, player.hands.cried, set);

    return this._parseScoreInfo(allTiles, validCombinations, game, player, lastTile);
  }

  private _parseScoreInfo(tiles: MahjongTile[], validCombinations: ValidCombination[], game: MahjongGame, player: MahjongPlayer, lastTile: MahjongDragon["lastTile"]): MahjongScoreInfo | null {
    const cried = player.hands.cried;

    if (ThirteenOrphans.checkByTiles(tiles)) {
      return {
        dragon: {
          head: [],
          body: [],
          lastTile,
          cried,
          player,
          tiles
        },
        scores: [{
          yaku: ThirteenOrphans,
          score: ThirteenOrphans.score
        }],
        subscore: 20
      };
    }

    const headAndBodies = this._getDragonHeadAndBody(validCombinations);
    if (headAndBodies.length <= 0) return null;

    const dragons: MahjongDragon[] = headAndBodies.map(headAndBody => {
      return {
        head: headAndBody.head,
        body: headAndBody.body,
        tiles,
        lastTile,
        cried,
        player
      };
    });

    const scores = dragons.map(dragon => ({
      dragon,
      score: this._getScore(dragon, game, cried)
    })).filter(({ score }) => {
      // 도라만 있는 경우 폐기
      if (score.length === 1 && score[0].yaku.yakuName === YAKU.DORA) return false;
      return true;
    });

    if (scores.length <= 0) return null;

    const subscores = scores.map(({ dragon, score }) => this._getSubscore(dragon, game, player, cried, score));
    const totalScores = scores.map(({ score: scoreArr }) => {
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

    if (totalScores[bestScoreIdx] <= 0) return null;

    const finalScore = scores[bestScoreIdx];

    // 역만을 포함한 케이스
    if (finalScore.score.some(({ score }) => score >= 13)) {
      finalScore.score = finalScore.score.filter(({ score }) => score >= 13); // 역만만 남김
    }

    return {
      dragon: finalScore.dragon,
      scores: finalScore.score,
      subscore: subscores[bestScoreIdx]
    };
  }

  private _parseRiichiDiscardables(hands: MahjongHands, isTenpai: boolean, validCombinations: ValidCombination[]): Set<MahjongTile> {
    if (hands.cried || !isTenpai || hands.game.tiles.left < 4) return new Set();

    const discardables = validCombinations.map(({ leftover }) => {
      if (leftover.length === 2) {
        return leftover; // 어느쪽이든 단기대기
      } else if (leftover.length === 3) {
        const cases = pick([0, 1, 2], 2);

        for (const [idx0, idx1] of cases) {
          const tile1 = leftover[idx0];
          const tile2 = leftover[idx1];
          const leftoverTile = leftover[3 - idx0 - idx1];

          if (this._canCreateSet(tile1, tile2)) return [leftoverTile];
        }
      }

      return null;
    }).filter(val => !!val).flat(1) as MahjongTile[];

    discardables.push(...ThirteenOrphans.riichiableByTiles(hands.tiles));

    return new Set(discardables);
  }

  private _parseTenpaiInfo(hands: MahjongHands, validCombinations: ValidCombination[]): {
    tiles: Set<number>;
    isFuriten: boolean;
  } {
    if (validCombinations.length <= 0) {
      return {
        tiles: new Set(ThirteenOrphans.getTenpaiCandidates(hands.tiles)),
        isFuriten: false
      };
    }

    const possibles = validCombinations.map(({ leftover, sevenPairCandidate, hasHead }) => {
      if (sevenPairCandidate || !hasHead) {
        return leftover.map(({ tileID }) => tileID);
      }

      return pick(leftover, 2).filter(tiles => {
        return this._canCreateSet(tiles[0], tiles[1]);
      }).map(tiles => {
        return this._getMissingSetTileIDs(tiles[0], tiles[1]);
      }).flat(1);
    }).flat(1);

    // Remove duplicates
    const discards = hands.discards;
    const possibleTiles = new Set(possibles);

    return {
      tiles: possibleTiles,
      isFuriten: discards.some(tile => possibleTiles.has(tile.tileID))
    };
  }

  private _getValidCombinations(allTiles: MahjongTile[], cried: boolean, set: MahjongSetInfo) {
    const combinations = [
      ...set.head,
      ...set.ordered,
      ...set.same,
      ...set.kang
    ];

    // 머리 + 몸통3개 픽 or 몸통4개 픽
    // 몸통1개 (2 or 3 tiles) or 머리1개 (1 or 2 tiles) 남음
    const correctCombinations = pick(combinations, 4).map(combination => {
      const headCount = combination.filter(comb => comb.type === BODY_TYPE.HEAD).length;

      if (headCount > 1) return null;

      return this._toValidCombination(combination, allTiles, false);
    }).filter(val => !!val) as ValidCombination[];

    if (!cried) {
      // 머리 6개 픽, 치또이쯔용
      const correctSevenPairsCombinations = pick(set.head, 6).map(combination => {
        return this._toValidCombination(combination, allTiles, true);
      }).filter(val => !!val) as ValidCombination[];

      correctCombinations.push(...correctSevenPairsCombinations);
    }

    return correctCombinations;
  }

  private _toValidCombination(combination: MahjongTileSet[], tiles: MahjongTile[], sevenPairCandidate: boolean): ValidCombination | null {
    const combinationTiles = combination.reduce((total, comb) => {
      return [...total, ...comb.tiles];
    }, []);

    const combinationTileSet = new Set(combinationTiles);
    const hasDuplication = combinationTileSet.size < combinationTiles.length;
    if (hasDuplication) return null;

    return {
      combination,
      leftover: tiles.filter(tile => !combinationTileSet.has(tile)),
      hasHead: combination.filter(comb => comb.type === BODY_TYPE.HEAD).length > 0,
      sevenPairCandidate
    };
  }

  private _canCreateSet(tile1: MahjongTile, tile2: MahjongTile) {
    if (tile1.type !== tile2.type) return false;
    if (tile1.tileID === tile2.tileID) return true;
    if (tile1.isLetter) return false;
    if (Math.abs(tile1.index - tile2.index) < 3) return true;
    return false;
  }

  private _getMissingSetTileIDs(tile1: MahjongTile, tile2: MahjongTile): number[] {
    if (tile1.tileID === tile2.tileID) return [tile1.tileID];

    // 슌쯔
    const idBase = tile1.tileID - tile1.index;
    const minIdx = Math.min(tile1.index, tile2.index);
    const maxIdx = Math.max(tile1.index, tile2.index);

    if (maxIdx - minIdx === 2) {
      return [idBase + maxIdx - 1]; // 간짱
    } else {
      const ids: number[] = [];

      if (minIdx > 0) ids.push(minIdx - 1);
      if (maxIdx < 8) ids.push(maxIdx + 1);

      return ids.map(index => idBase + index);
    }
  }

  private _getDragonHeadAndBody(validCombinations: ValidCombination[]): Array<{
    head: MahjongTile[][];
    body: MahjongTileSet[];
  }> {
    const correctCombinations = validCombinations
      .map(({ combination, leftover, hasHead, sevenPairCandidate }) => {
        if (sevenPairCandidate) {
          const heads = combination.map(({ tiles }) => tiles);
          heads.push(leftover);

          if (SevenPairs.isSevenPairs(heads)) {
            return {
              head: heads,
              body: []
            };
          } else {
            return null;
          }
        } else {
          if (!hasHead) {
            if (this._canFormHead(leftover)) {
              return {
                head: [leftover],
                body: combination
              };
            } else {
              return null;
            }
          } else {
            const bodyType = this._getBodyType(leftover);
            if (bodyType >= 0) {
              return {
                head: combination.filter(comb => comb.type === BODY_TYPE.HEAD).map(({ tiles }) => tiles),
                body: [
                  ...combination.filter(comb => comb.type !== BODY_TYPE.HEAD),
                  {
                    tiles: leftover.sort((a, b) => a.id - b.id),
                    type: bodyType,
                    borrowed: leftover.some(tile => tile.borrowed)
                  }
                ]
              };
            } else {
              return null;
            }
          }
        }
      }).filter(val => !!val);

    return correctCombinations as ReturnType<MahjongHandsParser["_getDragonHeadAndBody"]>;
  }

  private _canFormHead(tiles: MahjongTile[]): boolean {
    if (tiles.length !== 2) return false;

    return tiles[0].tileID === tiles[1].tileID;
  }

  private _getBodyType(tiles: MahjongTile[]): BODY_TYPE | -1 {
    if (tiles.length !== 3) return -1;

    const tilesInOrder = [...tiles].sort((a, b) => a.id - b.id);
    const tile0 = tilesInOrder[0];
    const tile1 = tilesInOrder[1];
    const tile2 = tilesInOrder[2];

    const isSame = tile0.tileID === tile1.tileID
      && tile1.tileID === tile2.tileID;

    if (isSame) {
      return BODY_TYPE.SAME;
    }

    const isSameType = tile0.type === tile1.type
      && tile1.type === tile2.type;

    const isOrdered = tile1.index === tile0.index + 1
      && tile2.index === tile1.index + 1;

    if (isSameType && isOrdered) {
      return BODY_TYPE.ORDERED;
    }

    return -1;
  }

  // 판수 계산
  private _getScore(dragon: MahjongDragon, game: MahjongGame, cried: boolean): Array<{
    score: number;
    yaku: Yaku;
  }> {
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
  private _getSubscore(dragon: MahjongDragon, game: MahjongGame, player: MahjongPlayer, cried: boolean, scores: Array<{
    score: number;
    yaku: Yaku;
  }>): number {
    // 특수 케이스들
    const isSevenPairs = scores.filter(({ yaku }) => yaku.yakuName === YAKU.SEVEN_PAIRS).length > 0;
    if (isSevenPairs) return 25;

    const pingHuMenzen = scores.filter(({ yaku }) => {
      return yaku.yakuName === YAKU.PINGHU
        || yaku.yakuName === YAKU.MENZEN_TSUMO;
    }).length === 2;
    if (pingHuMenzen) return 20;

    let score = 20;

    if (dragon.lastTile.isTsumo) {
      score += 2;
    } else if (!cried) {
      score += 10;
    }

    score += this._getWaitingFormSubScore(dragon);
    score += this._getSameSubScore(dragon, game, player);

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
  private _getSameSubScore(dragon: MahjongDragon, game: MahjongGame, player: MahjongPlayer): number {
    const { head, body } = dragon;

    let total = 0;

    const headTile = head[0][0];

    if (headTile.type === TILE_TYPE.SANGEN) total += 2;
    if (headTile.type === TILE_TYPE.KAZE) {
      if (headTile.index === player.getWind(game.round.wind)) total += 2;
      if (headTile.index === game.round.wind) total += 2;
    }

    body.forEach(set => {
      if (set.type === BODY_TYPE.ORDERED) return;

      let score = 2;
      const tile = set.tiles[0];
      const isKang = set.type === BODY_TYPE.KANG;

      if (isKang) score *= 4;
      if (isYaoChu(tile)) score *= 2;
      if (!set.borrowed) score *= 2;

      total += score;
    });

    return total;
  }
}

export default MahjongHandsParser;
