import { MessageActionRow, MessageButton, MessageEmbed, ThreadChannel } from "discord.js";

import VsGameRoom from "../VsGameRoom";

import * as EMOJI from "~/const/emoji";
import { GAME, CONNECT4 } from "~/const/command/minigame";
import { getRandom, groupBy, isBetween, range } from "~/util/helper";
import { blockOtherInteractions } from "~/command/minigame/utils";

class Connect4Game {
  private _threadChannel: ThreadChannel;
  private _players: VsGameRoom["players"];

  private _grid: number[][];
  private _lastPlayed: [number, number];
  private _playerIdx: number;
  private _ggFlag: boolean;

  public constructor(players: VsGameRoom["players"], threadChannel: ThreadChannel) {
    this._players = players;
    this._threadChannel = threadChannel;

    this._grid = range(6).map(() => [...range(7).map(() => -1)]);
    this._lastPlayed = [-1, -1];
    this._playerIdx = Math.round(Math.random());
    this._ggFlag = false;
  }

  public async start() {
    while (!this._isFinished()) {
      this._playerIdx = 1 - this._playerIdx;
      await this._nextTurn();
    }

    if (this._ggFlag) {
      await this._showGGMessage();
    } else {
      const winner = this._getWinner();
      await this._showGameFinishMessage(winner);
    }

    await this.destroy();
  }

  public async destroy() {
    const threadChannel = this._threadChannel;

    await threadChannel.setLocked(true).catch(() => void 0);
    await threadChannel.setArchived(true).catch(() => void 0);
  }

  private async _nextTurn() {
    const players = this._players;
    const threadChannel = this._threadChannel;
    const playerIdx = this._playerIdx;
    const opponentIdx = 1 - playerIdx;

    const board = this._drawBoard();
    const buttonRows = this._createButtons();

    const boardMsg = await threadChannel.send({
      content: CONNECT4.TURN_HEADER(players[playerIdx].user, playerIdx),
      embeds: [board],
      components: buttonRows
    });

    const collector = threadChannel.createMessageComponentCollector({
      filter: interaction => interaction.message.id === boardMsg.id,
      time: 60000, // 1 min
      dispose: true
    });

    collector.on("collect", async interaction => {
      const blocked = await blockOtherInteractions(interaction, players[playerIdx].user.id, players[opponentIdx].user.id);
      if (blocked) return;

      await interaction.update({ components: [] });

      if (interaction.customId === GAME.SYMBOL.GG) {
        return collector.stop(GAME.SYMBOL.GG);
      }

      const colIdx = parseFloat(interaction.customId);

      this._play(colIdx);

      collector.stop(GAME.SYMBOL.NEXT_TURN);
    });

    return new Promise<void>(resolve => {
      collector.on("end", async (_, reason) => {
        if (reason === GAME.SYMBOL.GG) {
          this._ggFlag = true;
          resolve();
        }

        if (reason !== GAME.SYMBOL.NEXT_TURN) {
          // Pick random col
          const grid = this._grid;
          const possibleColumns = range(7).filter(colIdx => {
            const colFilled = grid.every(row => row[colIdx] >= 0);
            return !colFilled;
          });

          const randomCol = getRandom(possibleColumns);
          this._play(randomCol);
        }

        resolve();
      });
    });
  }

  private _play(colIdx: number) {
    const grid = this._grid;
    const lastPlayed = this._lastPlayed;
    const playerIdx = this._playerIdx;

    for (let rowIdx = grid.length - 1; rowIdx >= 0; rowIdx--) {
      if (grid[rowIdx][colIdx] < 0) {
        grid[rowIdx][colIdx] = playerIdx;
        lastPlayed[0] = rowIdx;
        lastPlayed[1] = colIdx;
        break;
      }
    }
  }

  private _drawBoard() {
    const grid = this._grid;
    const lastPlayed = this._lastPlayed;
    const players = this._players;
    const playerIdx = this._playerIdx;
    const embed = new MessageEmbed();

    // draw number emoji
    const lines: string[] = [];

    grid.forEach((line, rowIdx) => {
      lines.push(line.map((val, colIdx) => {
        return (rowIdx === lastPlayed[0] && colIdx === lastPlayed[1])
          ? CONNECT4.CIRCLE[val + 2]
          : CONNECT4.CIRCLE[val];
      }).join(" "));
    });
    lines.push(range(grid[0].length).map(idx => `${idx + 1}${EMOJI.KEYCAP}`).join(" "));

    lines.push("");

    players.forEach((player, idx) => {
      lines.push(`${CONNECT4.CIRCLE[idx]}: ${player.user.displayName}`);
    });

    embed.setDescription(lines.join("\n"));
    embed.setColor(CONNECT4.COLOR[playerIdx]);

    return embed;
  }

  private _drawFinishedBoard(winner: number) {
    const grid = this._grid;
    const players = this._players;
    const connected4 = this._findConnected4();
    const embed = new MessageEmbed();

    connected4.forEach(([x, y]) => {
      grid[x][y] += 2;
    });

    // draw number emoji
    const lines: string[] = [];

    grid.forEach(line => {
      lines.push(line.map(val => CONNECT4.CIRCLE[val]).join(" "));
    });
    lines.push(range(grid[0].length).map(idx => `${idx + 1}${EMOJI.KEYCAP}`).join(" "));

    lines.push("");

    players.forEach((player, playerIdx) => {
      lines.push(`${playerIdx === winner ? EMOJI.CROWN : CONNECT4.CIRCLE[playerIdx]}: ${player.user.displayName}`);
    });

    embed.setDescription(lines.join("\n"));
    embed.setColor(CONNECT4.COLOR[winner]);

    return embed;
  }

  private _isFinished(): boolean {
    if (this._ggFlag) return true;

    const grid = this._grid;
    const connected4 = this._findConnected4();

    if (connected4.length > 0) {
      return true;
    }

    // Check whether grids are occupied
    const allFilled = grid.every(row => row.every(val => val >= 0));

    if (allFilled) {
      // Draw
      return true;
    } else {
      return false;
    }
  }

  private _getWinner(): number {
    const grid = this._grid;
    const lastPlayed = this._lastPlayed;
    const connected4 = this._findConnected4();

    if (connected4.length > 0) {
      const lastPlayer = grid[lastPlayed[0]][lastPlayed[1]];

      return lastPlayer;
    }

    return -1;
  }

  private _findConnected4() {
    const grid = this._grid;
    const lastPlayed = this._lastPlayed;
    const [x, y] = lastPlayed;

    if (x < 0 || y < 0) return [];

    const playerIdx = grid[x][y];

    for (const direction of CONNECT4.DIRECTIONS) {
      const pos = [x + direction[0], y + direction[1]];
      let connectCount = 1;

      while (
        isBetween(pos[0], 0, 5)
        && isBetween(pos[1], 0, 6)
        && grid[pos[0]][pos[1]] === playerIdx
      ) {
        connectCount += 1;
        pos[0] += direction[0];
        pos[1] += direction[1];
      }

      // Win by connect 4
      if (connectCount >= 4) return range(connectCount).map(idx => {
        return [x + direction[0] * idx, y + direction[1] * idx];
      });
    }

    return [];
  }

  private _createButtons() {
    const grid = this._grid;

    const buttons = range(7).map(idx => {
      const btn = new MessageButton()
        .setCustomId(idx.toString())
        .setEmoji(`${idx + 1}${EMOJI.KEYCAP}`)
        .setStyle("SECONDARY");

      const colFilled = grid.every(row => row[idx] >= 0);
      if (colFilled) btn.setDisabled(true);

      return btn;
    });

    const rows = groupBy(buttons, 5).map((btns => {
      return new MessageActionRow().addComponents(...btns);
    }));

    const ggButton = new MessageButton();

    ggButton.setLabel(GAME.SURRENDER);
    ggButton.setEmoji(EMOJI.WHITE_FLAG);
    ggButton.setCustomId(GAME.SYMBOL.GG);
    ggButton.setStyle("DANGER");

    rows[1].addComponents(ggButton);

    return rows;
  }

  private async _showGameFinishMessage(winner: number) {
    const threadChannel = this._threadChannel;
    const players = this._players;

    await threadChannel.send({
      content: GAME.WINNER_HEADER(players.map(({ user }) => user), winner),
      embeds: [this._drawFinishedBoard(winner)]
    });
  }

  private async _showGGMessage() {
    const threadChannel = this._threadChannel;
    const lastGrid = this._drawFinishedBoard(1 - this._playerIdx);

    await threadChannel.send({
      content: GAME.END_BY_SURRENDER(this._players[this._playerIdx].user),
      embeds: [lastGrid]
    }).catch(() => void 0);
  }
}

export default Connect4Game;
