import { ButtonBuilder } from "@siamese/button";
import { EMOJI } from "@siamese/emoji";
import { InteractionSender, type TextSender } from "@siamese/sender";
import { getRandom, range } from "@siamese/util";
import { ButtonStyle } from "discord.js";

import VSGameLogic from "../VSGameLogic";
import { GAME } from "../const";

import { TICTACTOE } from "./const";

import type { GameContext } from "../GameContext";
import type { VSPlayerActionParams, VSPlayerFinalActionParams } from "../types";

class TictactoeGame extends VSGameLogic {
  private _grid: number[][];

  public constructor(ctx: GameContext) {
    super({
      ctx,
      randomizeFirstPlayer: true,
      maxWaitTime: 60 // 1분
    });

    this._grid = range(3).map(() => [...range(3).map(() => -1)]);
  }

  public override async showCurrentBoard(): Promise<TextSender[]> {
    const buttons = this._createButtons(false);
    const currentPlayer = this.currentPlayer;

    const boardMsg = await this.sender.sendObject({
      content: TICTACTOE.TURN_HEADER(currentPlayer.user, currentPlayer.index),
      components: buttons.build()
    });

    return [boardMsg];
  }

  public override async onPlayerAction({ interaction, stop }: VSPlayerActionParams): Promise<void> {
    const updater = new InteractionSender(interaction, false);
    const buttons = this._createButtons(true);

    await updater.editObject({
      components: buttons.build()
    });

    stop(GAME.SYMBOL.NEXT_TURN, { deleteButtons: false });
  }

  public override async onPlayerFinalAction({ id }: VSPlayerFinalActionParams): Promise<void> {
    const grid = this._grid;
    const playerIdx = this.currentPlayer.index;
    const [rowIdx, colIdx] = id.split("/").map(val => parseFloat(val));

    grid[rowIdx][colIdx] = playerIdx;
  }

  public override async onPlayerAFK(): Promise<void> {
    // 임의의 지점 선택
    const grid = this._grid;
    const playerIdx = this.currentPlayer.index;
    const emptyPositions = grid.reduce((total, row, rowIdx) => {
      const emptyColumns = row.filter(val => val < 0);

      return [...total, ...emptyColumns.map((_col, colIdx) => ({ rowIdx, colIdx }))];
    }, [] as Array<{ rowIdx: number; colIdx: number }>);

    const randomPos = getRandom(emptyPositions);

    grid[randomPos.rowIdx][randomPos.colIdx] = playerIdx;
  }

  public override checkGameFinished(): boolean {
    const grid = this._grid;

    // horizontal
    for (const row of grid) {
      const rowSum = row.reduce((total, val) => total + val, 0);
      const filled = row.every(col => col >= 0);
      const hasSameCol = filled && (rowSum === 0 || rowSum === 3);

      if (hasSameCol) {
        return true;
      }
    }

    // vertical
    for (const colIdx of range(3)) {
      const colSum = grid.reduce((total, row) => total + row[colIdx], 0);
      const filled = grid.every(row => row[colIdx] >= 0);
      const hasSameCol = filled && (colSum === 0 || colSum === 3);

      if (hasSameCol) {
        return true;
      }
    }

    // diagnoal
    const sePositions = [
      [0, 0], [1, 1], [2, 2]
    ];
    const swPositions = [
      [0, 2], [1, 1], [2, 0]
    ];

    const seSum = sePositions.reduce((total, pos) => total + grid[pos[0]][pos[1]], 0);
    const seFilled = sePositions.every(pos => grid[pos[0]][pos[1]] >= 0);
    const swSum = swPositions.reduce((total, pos) => total + grid[pos[0]][pos[1]], 0);
    const swFilled = swPositions.every(pos => grid[pos[0]][pos[1]] >= 0);

    if (seFilled && (seSum === 0) || (seSum === 3)) {
      return true;
    }

    if (swFilled && (swSum === 0) || (swSum === 3)) {
      return true;
    }

    const allFilled = grid.every(row => row.every(val => val >= 0));

    return allFilled;
  }

  public override async showGameFinishMessage(): Promise<void> {
    const sender = this.sender;
    const players = this.players;
    const winner = this._getWinner();
    const buttons = this._createButtons(true);

    await sender.sendObject({
      content: GAME.WINNER_HEADER(players.map(({ user }) => user), winner),
      components: buttons.build()
    });
  }

  public override async showSurrenderMessage(): Promise<void> {
    // 항복 없음
  }

  public override async showTimeoutMessage(): Promise<void> {
    // 시간제한 없음
  }

  private _createButtons(disabled: boolean) {
    const buttons = new ButtonBuilder();
    const grid = this._grid;

    for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
      for (let colIdx = 0; colIdx < 3; colIdx++) {
        const playerIdx = grid[rowIdx][colIdx];

        buttons.addButton({
          id: `${rowIdx}/${colIdx}`,
          label: playerIdx >= 0
            ? TICTACTOE.MARK[playerIdx]
            : EMOJI.ZERO_WIDTH_SPACE,
          style: playerIdx >= 0
            ? TICTACTOE.STYLE[playerIdx]
            : ButtonStyle.Secondary,
          disabled: disabled || playerIdx >= 0
        });
      }

      buttons.addSeparator();
    }

    return buttons;
  }

  private _getWinner(): number {
    const grid = this._grid;

    // horizontal
    for (const row of grid) {
      const rowSum = row.reduce((total, val) => total + val, 0);
      const filled = row.every(col => col >= 0);
      const hasSameCol = filled && (rowSum === 0 || rowSum === 3);

      if (hasSameCol) {
        return rowSum / 3;
      }
    }

    // vertical
    for (const colIdx of range(3)) {
      const colSum = grid.reduce((total, row) => total + row[colIdx], 0);
      const filled = grid.every(row => row[colIdx] >= 0);
      const hasSameCol = filled && (colSum === 0 || colSum === 3);

      if (hasSameCol) {
        return colSum / 3;
      }
    }

    // diagnoal
    const sePositions = [
      [0, 0], [1, 1], [2, 2]
    ];
    const swPositions = [
      [0, 2], [1, 1], [2, 0]
    ];

    const seSum = sePositions.reduce((total, pos) => total + grid[pos[0]][pos[1]], 0);
    const seFilled = sePositions.every(pos => grid[pos[0]][pos[1]] >= 0);
    const swSum = swPositions.reduce((total, pos) => total + grid[pos[0]][pos[1]], 0);
    const swFilled = swPositions.every(pos => grid[pos[0]][pos[1]] >= 0);

    if (seFilled && (seSum === 0) || (seSum === 3)) {
      return seSum / 3;
    }

    if (swFilled && (swSum === 0) || (swSum === 3)) {
      return swSum / 3;
    }

    return -1;
  }
}

export { TictactoeGame };
