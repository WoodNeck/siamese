import { MessageActionRow, MessageButton, ThreadChannel } from "discord.js";

import VsGameRoom from "../VsGameRoom";

import { GAME, TICTACTOE } from "~/const/command/minigame";
import * as EMOJI from "~/const/emoji";
import { getRandom, range } from "~/util/helper";
import { blockOtherInteractions } from "~/command/minigame/utils";
import { BUTTON_STYLE } from "~/const/discord";

class TicTacToeGame {
  private _threadChannel: ThreadChannel;
  private _players: VsGameRoom["players"];

  private _grid: number[][];
  private _playerIdx: number;

  public constructor(players: VsGameRoom["players"], threadChannel: ThreadChannel) {
    this._players = players;
    this._threadChannel = threadChannel;

    this._grid = range(3).map(() => [...range(3).map(() => -1)]);

    this._playerIdx = Math.round(Math.random());
  }

  public async start() {
    while (!this._isFinished()) {
      this._playerIdx = 1 - this._playerIdx;
      await this._nextTurn();
    }

    const winner = this._getWinner();
    await this._showGameFinishMessage(winner);

    await this.destroy();
  }

  public async destroy() {
    const threadChannel = this._threadChannel;

    await threadChannel.setLocked(true).catch(() => void 0);
    await threadChannel.setArchived(true).catch(() => void 0);
  }

  private async _nextTurn() {
    const threadChannel = this._threadChannel;
    const buttons = this._createButtons();
    const players = this._players;
    const playerIdx = this._playerIdx;
    const opponentIdx = 1 - playerIdx;
    const grid = this._grid;

    const boardMsg = await threadChannel.send({
      content: TICTACTOE.TURN_HEADER(players[playerIdx].user, playerIdx),
      components: buttons
    });

    const collector = threadChannel.createMessageComponentCollector({
      filter: interaction => interaction.message.id === boardMsg.id,
      time: 60000, // 1 min
      dispose: true
    });

    collector.on("collect", async interaction => {
      const blocked = await blockOtherInteractions(interaction, players[playerIdx].user.id, players[opponentIdx].user.id);
      if (blocked) return;

      await interaction.update({
        components: buttons.map(row => {
          row.components.forEach(btn => {
            btn.setDisabled(true);
          });

          return row;
        })
      });

      const [rowIdx, colIdx] = interaction.customId.split("/");

      grid[rowIdx][colIdx] = playerIdx;
      collector.stop(GAME.SYMBOL.NEXT_TURN);
    });

    return new Promise<void>(resolve => {
      collector.on("end", async (_, reason) => {
        if (reason === GAME.SYMBOL.NEXT_TURN) return resolve();

        // Choose random spot
        const emptyPositions = grid.reduce((total, row, rowIdx) => {
          const emptyColumns = row.filter(val => val < 0);

          return [...total, ...emptyColumns.map((col, colIdx) => ({ rowIdx, colIdx }))];
        }, [] as Array<{ rowIdx: number; colIdx: number }>);

        const randomPos = getRandom(emptyPositions);

        grid[randomPos.rowIdx][randomPos.colIdx] = playerIdx;

        resolve();
      });
    });
  }

  private _createButtons(): MessageActionRow[] {
    const grid = this._grid;

    const rows = range(3).map(rowIdx => {
      const row = new MessageActionRow();

      const buttons = range(3).map(colIdx => {
        const btn = new MessageButton()
          .setCustomId(`${rowIdx}/${colIdx}`);
        const playerIdx = grid[rowIdx][colIdx];

        if (playerIdx >= 0) {
          btn.setLabel(TICTACTOE.MARK[playerIdx]);
          btn.setStyle(TICTACTOE.STYLE[playerIdx]);
          btn.setDisabled(true);
        } else {
          btn.setLabel(EMOJI.ZERO_WIDTH_SPACE);
          btn.setStyle(BUTTON_STYLE.SECONDARY);
        }

        return btn;
      });

      row.addComponents(...buttons);
      return row;
    });

    return rows;
  }

  private _isFinished(): boolean {
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

  private async _showGameFinishMessage(winner: number) {
    const threadChannel = this._threadChannel;
    const players = this._players;
    const buttons = this._createButtons();

    await threadChannel.send({
      content: GAME.WINNER_HEADER(players.map(({ user }) => user), winner),
      components: buttons
    }).catch(() => void 0);
  }
}

export default TicTacToeGame;
