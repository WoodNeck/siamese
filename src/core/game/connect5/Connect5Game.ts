import { MessageActionRow, MessageButton, MessageEmbed, ThreadChannel } from "discord.js";

import VsGameRoom from "../VsGameRoom";

import * as EMOJI from "~/const/emoji";
import { GAME, CONNECT5 } from "~/const/command/minigame";
import { BUTTON_STYLE } from "~/const/discord";
import { groupBy, isBetween, range } from "~/util/helper";
import { blockOtherInteractions } from "~/command/minigame/utils";

class Connect5Game {
  private _threadChannel: ThreadChannel;
  private _players: VsGameRoom["players"];

  private _grid: number[][];
  private _lastPlayed: [number, number];
  private _playerIdx: number;
  private _ggFlag: boolean;
  private _timeoutFlag: boolean;

  public constructor(players: VsGameRoom["players"], threadChannel: ThreadChannel) {
    this._players = players;
    this._threadChannel = threadChannel;

    this._grid = range(11).map(() => [...range(11).map(() => -1)]);
    this._lastPlayed = [-1, -1];
    this._playerIdx = Math.round(Math.random());
    this._ggFlag = false;
    this._timeoutFlag = false;
  }

  public async start() {
    while (!this._isFinished()) {
      this._playerIdx = 1 - this._playerIdx;
      await this._nextTurn();
    }

    if (this._timeoutFlag) {
      await this._showTimeoutMessage();
    } else if (this._ggFlag) {
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
    const cursor = this._findNearestCusorPoint();

    const board = this._drawBoard(cursor);
    const buttonRows = this._createButtons(cursor);

    const boardMsg = await threadChannel.send({
      content: CONNECT5.TURN_HEADER(players[playerIdx].user, playerIdx),
      embeds: [board],
      components: buttonRows
    });

    const collector = boardMsg.createMessageComponentCollector({
      time: 300000, // 5 min
      dispose: true
    });

    collector.on("collect", async interaction => {
      const blocked = await blockOtherInteractions(interaction, players[playerIdx].user.id, players[opponentIdx].user.id);
      if (blocked) return;

      if (interaction.customId === GAME.SYMBOL.GG) {
        await interaction.update({ components: [] }).catch(() => void 0);

        return collector.stop(GAME.SYMBOL.GG);
      } else if (interaction.customId === GAME.SYMBOL.SELECT) {
        await interaction.update({ components: [] }).catch(() => void 0);

        this._play(...cursor);
        return collector.stop(GAME.SYMBOL.NEXT_TURN);
      } else {
        const direction = CONNECT5.DIRECTIONS[interaction.customId];

        cursor[0] += direction[0];
        cursor[1] += direction[1];

        await interaction.update({
          embeds: [this._drawBoard(cursor)],
          components: this._createButtons(cursor)
        }).catch(() => void 0);
      }
    });

    return new Promise<void>(resolve => {
      collector.on("end", async (_, reason) => {
        if (reason === GAME.SYMBOL.NEXT_TURN) return resolve();

        if (reason === GAME.SYMBOL.GG) {
          this._ggFlag = true;
        } else {
          this._timeoutFlag = true;
        }

        resolve();
      });
    });
  }

  private _play(rowIdx: number, colIdx: number) {
    const grid = this._grid;
    const lastPlayed = this._lastPlayed;
    const playerIdx = this._playerIdx;

    lastPlayed[0] = rowIdx;
    lastPlayed[1] = colIdx;
    grid[rowIdx][colIdx] = playerIdx;
  }

  private _drawBoard(cursor: [number, number]) {
    const grid = this._grid;
    const lastPlayed = this._lastPlayed;
    const players = this._players;
    const playerIdx = this._playerIdx;
    const embed = new MessageEmbed();

    // draw number emoji
    const lines: string[] = [];

    grid.forEach((line, rowIdx) => {
      lines.push(line.map((val, colIdx) => {
        if (rowIdx === cursor[0] && colIdx === cursor[1]) {
          return CONNECT5.CURSOR[val];
        } else {
          return (rowIdx === lastPlayed[0] && colIdx === lastPlayed[1])
            ? CONNECT5.PIECE[val + 2]
            : CONNECT5.PIECE[val];
        }
      }).join(" "));
    });

    lines.push("");

    players.forEach((player, idx) => {
      lines.push(`${CONNECT5.PIECE[idx]}: ${player.user.displayName}`);
    });

    embed.setDescription(lines.join("\n"));
    embed.setColor(CONNECT5.COLOR[playerIdx]);

    return embed;
  }

  private _drawFinishedBoard(winner: number) {
    const grid = this._grid;
    const players = this._players;
    const connected = this._findConnected5();
    const embed = new MessageEmbed();

    connected.forEach(([x, y]) => {
      grid[x][y] += 2;
    });

    const lines: string[] = [];

    grid.forEach(line => {
      lines.push(line.map(val => CONNECT5.PIECE[val]).join(" "));
    });

    lines.push("");

    players.forEach((player, playerIdx) => {
      lines.push(`${playerIdx === winner ? EMOJI.CROWN : CONNECT5.PIECE[playerIdx]}: ${player.user.displayName}`);
    });

    embed.setDescription(lines.join("\n"));
    embed.setColor(CONNECT5.COLOR[winner]);

    return embed;
  }

  private _isFinished(): boolean {
    if (this._ggFlag || this._timeoutFlag) return true;

    const grid = this._grid;
    const connected = this._findConnected5();

    if (connected.length > 0) {
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
    const connected = this._findConnected5();

    if (connected.length > 0) {
      const lastPlayer = grid[lastPlayed[0]][lastPlayed[1]];

      return lastPlayer;
    }

    return -1;
  }

  private _findConnected5() {
    const grid = this._grid;
    const lastPlayed = this._lastPlayed;
    const [x, y] = lastPlayed;

    if (x < 0 || y < 0) return [];

    const playerIdx = grid[x][y];
    const directionSets = [
      [CONNECT5.DIRECTIONS[0], CONNECT5.DIRECTIONS[1]],
      [CONNECT5.DIRECTIONS[2], CONNECT5.DIRECTIONS[3]],
      [CONNECT5.DIRECTIONS[4], CONNECT5.DIRECTIONS[7]],
      [CONNECT5.DIRECTIONS[5], CONNECT5.DIRECTIONS[6]]
    ];

    for (const directions of directionSets) {
      const connected = directions.reduce((total, direction) => {
        const pos = [x + direction[0], y + direction[1]];
        const connects: Array<[number, number]> = [];

        while (
          isBetween(pos[0], 0, grid.length - 1)
          && isBetween(pos[1], 0, grid.length - 1)
          && grid[pos[0]][pos[1]] === playerIdx
        ) {
          connects.push([pos[0], pos[1]]);
          pos[0] += direction[0];
          pos[1] += direction[1];
        }

        return [...total, ...connects];
      }, [[x, y]]);

      // Win by connect 5
      if (connected.length >= 5) return connected;
    }

    return [];
  }

  private _findNearestCusorPoint(): [number, number] {
    const grid = this._grid;
    const lastPlayed = this._lastPlayed;

    if (lastPlayed[0] >= 0 && lastPlayed[1] >= 0) {
      const x = lastPlayed[0];
      const y = lastPlayed[1];
      const topBottom = CONNECT5.DIRECTIONS.slice(0, 2);
      const leftRight = CONNECT5.DIRECTIONS.slice(2, 4);
      const diagDir = CONNECT5.DIRECTIONS.slice(4);

      for (let distance = 1; distance < 11; distance++) {
        for (const dir of leftRight) {
          const centerX = x + distance * dir[0];
          const centerY = y + distance * dir[1];

          if (!isBetween(centerX, 0, grid.length) || !isBetween(centerY, 0, grid.length)) continue;

          if (grid[centerX][centerY] < 0) return [centerX, centerY];

          for (let subDist = 1; subDist < distance; subDist++) {
            for (const subDir of topBottom) {
              const pointX = centerX + subDist * subDir[0];
              const pointY = centerY + subDist * subDir[1];

              if (!isBetween(pointX, 0, grid.length) || !isBetween(pointY, 0, grid.length)) continue;

              if (grid[pointX][pointY] < 0) return [pointX, pointY];
            }
          }
        }

        for (const dir of topBottom) {
          const centerX = x + distance * dir[0];
          const centerY = y + distance * dir[1];

          if (!isBetween(centerX, 0, grid.length) || !isBetween(centerY, 0, grid.length)) continue;

          if (grid[centerX][centerY] < 0) return [centerX, centerY];

          for (let subDist = 1; subDist < distance; subDist++) {
            for (const subDir of leftRight) {
              const pointX = centerX + subDist * subDir[0];
              const pointY = centerY + subDist * subDir[1];

              if (!isBetween(pointX, 0, grid.length) || !isBetween(pointY, 0, grid.length)) continue;

              if (grid[pointX][pointY] < 0) return [pointX, pointY];
            }
          }
        }

        for (const dir of diagDir) {
          const pointX = x + distance * dir[0];
          const pointY = y + distance * dir[1];

          if (!isBetween(pointX, 0, grid.length) || !isBetween(pointY, 0, grid.length)) continue;

          if (grid[pointX][pointY] < 0) return [pointX, pointY];
        }
      }
    }

    return [5, 5];
  }

  private _createButtons(cursor: [number, number]) {
    const grid = this._grid;

    const buttons = [
      EMOJI.ARROW.NW,
      EMOJI.ARROW.N,
      EMOJI.ARROW.NE,
      EMOJI.ARROW.W,
      EMOJI.ARROW.E,
      EMOJI.ARROW.SW,
      EMOJI.ARROW.S,
      EMOJI.ARROW.SE
    ].map((emoji, idx) => {
      const dirIdx = CONNECT5.DIR_INDEX_MAP[idx];
      const direction = CONNECT5.DIRECTIONS[dirIdx];
      const btn = new MessageButton()
        .setCustomId(dirIdx.toString())
        .setEmoji(emoji)
        .setStyle(BUTTON_STYLE.SECONDARY);

      const x = cursor[0] + direction[0];
      const y = cursor[1] + direction[1];

      if (!isBetween(x, 0, grid.length) || !isBetween(y, 0, grid.length)) btn.setDisabled(true);

      return btn;
    });

    const selectBtn = new MessageButton();
    selectBtn.setCustomId(GAME.SYMBOL.SELECT);
    selectBtn.setEmoji(EMOJI.GREEN_CHECK);
    selectBtn.setStyle(BUTTON_STYLE.SECONDARY);
    if (grid[cursor[0]][cursor[1]] >= 0) selectBtn.setDisabled(true);

    buttons.splice(4, 0, selectBtn);

    const rows = groupBy(buttons, 3).map((btns => {
      return new MessageActionRow().addComponents(...btns);
    }));

    const ggButton = new MessageButton();

    ggButton.setLabel(GAME.SURRENDER);
    ggButton.setEmoji(EMOJI.WHITE_FLAG);
    ggButton.setCustomId(GAME.SYMBOL.GG);
    ggButton.setStyle("DANGER");

    rows[2].addComponents(ggButton);

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

  private async _showTimeoutMessage() {
    const threadChannel = this._threadChannel;
    const lastGrid = this._drawFinishedBoard(1 - this._playerIdx);

    await threadChannel.send({
      content: GAME.END_BY_TIME,
      embeds: [lastGrid]
    }).catch(() => void 0);
  }
}

export default Connect5Game;
