import { ButtonBuilder } from "@siamese/button";
import { COLOR } from "@siamese/color";
import { EmbedBuilder } from "@siamese/embed";
import { EMOJI } from "@siamese/emoji";
import { getRandom, range } from "@siamese/util";
import { ButtonStyle } from "discord.js";

import VSGameLogic from "../VSGameLogic";
import { GAME } from "../const";

import { OTHELLO } from "./const";

import type { GameContext } from "../GameContext";
import type { VSPlayerActionParams, VSPlayerFinalActionParams } from "../types";
import type { TextSender } from "@siamese/sender";

class OthelloGame extends VSGameLogic {
  private _grid: number[][];
  private _changes: number[][];
  private _turnContext: ReturnType<OthelloGame["_calcCandidates"]>;

  public constructor(ctx: GameContext) {
    super({
      ctx,
      randomizeFirstPlayer: true,
      maxWaitTime: 60 // 1분
    });

    this._grid = range(8).map(() => [...range(8).map(() => -1)]);
    this._grid[3][3] = 1;
    this._grid[3][4] = 0;
    this._grid[4][3] = 0;
    this._grid[4][4] = 1;
    this._changes = range(8).map(() => [...range(8).map(() => -1)]);
    this._turnContext = this._calcCandidates(this.currentPlayer.index);
  }

  public override async showCurrentBoard(): Promise<TextSender[]> {
    const sender = this.sender;
    const { candidates, markerCount } = this._turnContext;

    const buttons = this._createButtons(markerCount);
    const messages = buttons.map((btn, idx) => {
      if (idx === 0) {
        return sender.sendObject({
          ...this._drawPlayingGrid(candidates),
          components: btn.build()
        });
      } else {
        return sender.sendObject({
          components: btn.build()
        });
      }
    });

    return await Promise.all(messages);
  }

  public override async onPlayerAction({ stop }: VSPlayerActionParams): Promise<void> {
    stop(GAME.SYMBOL.NEXT_TURN);
  }

  public override async onPlayerFinalAction({ id }: VSPlayerFinalActionParams): Promise<void> {
    const candidatePositions = this._getCandidatePositions();

    const [rowIdx, colIdx] = candidatePositions[parseFloat(id)];
    this._placeAtGrid(rowIdx, colIdx);
  }

  public override async onPlayerAFK(): Promise<void> {
    // 랜덤한 좌표를 하나 선정
    const candidatePositions = this._getCandidatePositions();

    const [rowIdx, colIdx] = getRandom(candidatePositions);
    this._placeAtGrid(rowIdx, colIdx);
  }

  public checkGameFinished(): boolean {
    this._turnContext = this._calcCandidates(this.getOpponentIndex());

    return this._turnContext.markerCount <= 0;
  }

  public override async showGameFinishMessage(): Promise<void> {
    const sender = this.sender;
    const winnerInfo = this._getWinnerInfo();
    const board = this._drawFinishedGrid(winnerInfo);
    const users = this.players.map(({ user }) => user);

    await sender.sendObject({
      content: GAME.WINNER_HEADER(users, winnerInfo.winner),
      embeds: [board.build()]
    });
  }

  public override async showSurrenderMessage(): Promise<void> {
    const sender = this.sender;
    const winnerInfo = this._getWinnerInfo();
    const board = this._drawFinishedGrid(winnerInfo);

    await sender.sendObject({
      content: GAME.END_BY_SURRENDER(this.currentPlayer.user),
      embeds: [board.build()]
    });
  }

  public override async showTimeoutMessage(): Promise<void> {
    // 타임아웃으로 인한 패배는 존재하지 않음
  }

  private _drawPlayingGrid(candidates: Array<Array<string | null>>) {
    const embed = new EmbedBuilder();
    const board = this._drawBoard(candidates);
    const [whiteCount, blackCount] = this._getDiscCount();
    const users = this.players.map(({ user }) => user);
    const playerIdx = this.currentPlayer.index;

    embed.setDescription(board);
    embed.setColor(this._getPlayerColor(playerIdx));
    embed.addField(OTHELLO.FIELD_TITLE(users), OTHELLO.FIELD_DESC(users, whiteCount, blackCount));

    return {
      content: OTHELLO.TURN_HEADER(users[playerIdx], playerIdx),
      embeds: [embed.build()]
    };
  }

  private _drawFinishedGrid({ winner, whiteCount, blackCount }: ReturnType<OthelloGame["_getWinnerInfo"]>) {
    const changes = this._changes;
    const embed = new EmbedBuilder();
    const users = this.players.map(({ user }) => user);

    changes.forEach(row => {
      row.forEach((_, idx) => row[idx] = -1);
    });

    const board = this._drawBoard();

    const winnerColor = this._getPlayerColor(winner);

    embed.setDescription(board);
    embed.setColor(winnerColor);
    embed.addField(OTHELLO.FIELD_TITLE(users), OTHELLO.FIELD_DESC(users, whiteCount, blackCount));

    return embed;
  }

  private _drawBoard(candidates?: Array<Array<string | null>>) {
    const grid = this._grid;
    const changes = this._changes;

    return grid.map((row, rowIdx) => {
      return row.map((val, colIdx) => {
        if (changes[rowIdx][colIdx] >= 0) return OTHELLO.DISC_ACTIVE[changes[rowIdx][colIdx]];
        if (val >= 0) return OTHELLO.DISC[val];
        if (candidates && candidates[rowIdx][colIdx]) return candidates[rowIdx][colIdx];

        return EMOJI.SMALL_BLACK_SQUARE;
      }).join(" ");
    }).join("\n");
  }

  private _getWinnerInfo() {
    const [whiteCount, blackCount] = this._getDiscCount();

    const winner = whiteCount > blackCount
      ? 0
      : blackCount > whiteCount
        ? 1
        : -1;

    return {
      winner,
      whiteCount,
      blackCount
    };
  }

  private _createButtons(markerCount: number) {
    // 25개 이상일 경우 메시지를 2개로 분할해야 함 (잘 발생하진 않음)
    if (markerCount > 25) {
      const buttons1 = new ButtonBuilder();
      const buttons2 = new ButtonBuilder();

      for (let markerIndex = 0; markerIndex < 25; markerIndex++) {
        buttons1.addButton({
          id: markerIndex.toString(),
          emoji: OTHELLO.CANDIDATE_MARKERS[markerIndex],
          style: ButtonStyle.Secondary
        });
      }

      for (let markerIndex = 25; markerIndex < markerCount; markerIndex++) {
        buttons2.addButton({
          id: markerIndex.toString(),
          emoji: OTHELLO.CANDIDATE_MARKERS[markerIndex],
          style: ButtonStyle.Secondary
        });
      }

      buttons2.addButton({
        label: GAME.SURRENDER,
        emoji: EMOJI.WHITE_FLAG,
        id: GAME.SYMBOL.GG,
        style: ButtonStyle.Danger
      });

      return [
        buttons1,
        buttons2
      ];
    } else {
      const buttons = new ButtonBuilder();

      for (let markerIndex = 0; markerIndex < markerCount; markerIndex++) {
        buttons.addButton({
          id: markerIndex.toString(),
          emoji: OTHELLO.CANDIDATE_MARKERS[markerIndex],
          style: ButtonStyle.Secondary
        });
      }

      buttons.addButton({
        label: GAME.SURRENDER,
        emoji: EMOJI.WHITE_FLAG,
        id: GAME.SYMBOL.GG,
        style: ButtonStyle.Danger
      });

      return [buttons];
    }
  }

  private _placeAtGrid(x: number, y: number) {
    const grid = this._grid;
    const changes = this._changes;
    const playerIdx = this.currentPlayer.index;
    const opponentIdx = 1 - playerIdx;

    grid[x][y] = playerIdx;

    // reset changes
    changes.forEach(row => {
      row.forEach((_, idx) => row[idx] = -1);
    });

    changes[x][y] = playerIdx;

    for (const direction of OTHELLO.DIRECTIONS) {
      const pos = [x + direction[0], y + direction[1]];
      let count = 1;

      while (
        pos[0] >= 0 && pos[0] <= 7
        && pos[1] >= 0 && pos[1] <= 7
        && grid[pos[0]][pos[1]] === opponentIdx
      ) {
        pos[0] += direction[0];
        pos[1] += direction[1];

        if (
          pos[0] >= 0 && pos[0] <= 7
          && pos[1] >= 0 && pos[1] <= 7
          && grid[pos[0]][pos[1]] === playerIdx
        ) {
          range(count).forEach(idx => {
            const offset = idx + 1;
            const posX = x + direction[0] * offset;
            const posY = y + direction[1] * offset;

            grid[posX][posY] = playerIdx;
            changes[posX][posY] = playerIdx + 2;
          });
          break;
        }

        count += 1;
      }
    }
  }

  private _getDiscCount() {
    const grid = this._grid;
    const whiteCount = grid.reduce((whites, row) => {
      return [...whites, ...row.filter(val => val === 0)];
    }, []).length;
    const blackCount = grid.reduce((blacks, row) => {
      return [...blacks, ...row.filter(val => val === 1)];
    }, []).length;

    return [whiteCount, blackCount];
  }

  private _getPlayerColor(index: number) {
    if (index < 0) return COLOR.BLACK;
    return index === 0
      ? COLOR.ORANGE
      : COLOR.BLUE;
  }

  private _calcCandidates(playerIdx: number) {
    const grid = this._grid;

    let markerOffset = 0;
    const candidates = range(8).map(() => [...range(8).map(() => null)]) as Array<Array<string | null>>;
    const opponentIdx = 1 - playerIdx;

    candidates.forEach((row, rowIdx) => {
      row.forEach((_, colIdx) => {
        if (grid[rowIdx][colIdx] >= 0) return;

        for (const direction of OTHELLO.DIRECTIONS) {
          const pos = [rowIdx + direction[0], colIdx + direction[1]];

          while (
            pos[0] >= 0 && pos[0] <= 7
            && pos[1] >= 0 && pos[1] <= 7
            && grid[pos[0]][pos[1]] === opponentIdx
          ) {
            pos[0] += direction[0];
            pos[1] += direction[1];

            if (
              pos[0] >= 0 && pos[0] <= 7
              && pos[1] >= 0 && pos[1] <= 7
              && grid[pos[0]][pos[1]] === playerIdx
            ) {
              candidates[rowIdx][colIdx] = OTHELLO.CANDIDATE_MARKERS[markerOffset++];
              break;
            }
          }

          if (candidates[rowIdx][colIdx]) return;
        }
      });
    });

    return {
      candidates,
      markerCount: markerOffset
    };
  }

  private _getCandidatePositions() {
    const { candidates } = this._turnContext;

    return candidates.reduce((positions, row, rowIdx) => {
      const posMapped = row.map((val, colIdx) => !!val && [rowIdx, colIdx]).filter(val => !!val) as Array<[number, number]>;
      return [...positions, ...posMapped];
    }, [] as Array<[number, number]>);
  }
}

export { OthelloGame };
