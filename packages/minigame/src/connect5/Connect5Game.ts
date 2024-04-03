import { ButtonBuilder } from "@siamese/button";
import { EmbedBuilder } from "@siamese/embed";
import { EMOJI } from "@siamese/emoji";
import { isBetween, range } from "@siamese/util";
import { ButtonStyle } from "discord.js";

import VSGameLogic from "../VSGameLogic";
import { GAME } from "../const";

import { CONNECT5 } from "./const";

import type { GameContext } from "../GameContext";
import type { VSPlayerActionParams } from "../types";
import type { TextSender } from "@siamese/sender";

class Connect5Game extends VSGameLogic {
  private _grid: number[][];
  private _lastPlayed: [number, number];
  private _cursor: [number, number];

  public constructor(ctx: GameContext) {
    super({
      ctx,
      randomizeFirstPlayer: true,
      maxWaitTime: 5 * 60 // 5분
    });

    this._grid = range(11).map(() => [...range(11).map(() => -1)]);
    this._cursor = [5, 5];
    this._lastPlayed = [-1, -1];
  }

  public override async showCurrentBoard(): Promise<TextSender[]> {
    const players = this.players;
    const playerIdx = this.currentPlayer.index;

    // 현재 커서 업데이트
    this._cursor = this._findNearestCusorPoint();

    const cursor = this._cursor;
    const board = this._drawBoard(cursor);
    const buttonRows = this._createButtons(cursor);

    const boardMsg = await this.sender.sendObject({
      content: CONNECT5.TURN_HEADER(players[playerIdx].user, playerIdx),
      embeds: [board.build()],
      components: buttonRows.build()
    });

    return [boardMsg];
  }

  public override async onPlayerAction({ id, sender, stop }: VSPlayerActionParams): Promise<void> {
    if (id === GAME.SYMBOL.SELECT) {
      return stop(GAME.SYMBOL.NEXT_TURN);
    } else {
      const cursor = this._cursor;
      const direction = CONNECT5.DIRECTIONS[parseFloat(id)];

      cursor[0] += direction[0];
      cursor[1] += direction[1];

      await sender.editObject({
        embeds: [this._drawBoard(cursor).build()],
        components: this._createButtons(cursor).build()
      });
    }
  }

  public override async onPlayerFinalAction(): Promise<void> {
    this._play(...this._cursor);
  }

  public override async onPlayerAFK(): Promise<void> {
    this.finishGameByTimeout();
  }

  public override checkGameFinished(): boolean {
    const grid = this._grid;
    const connected = this._findConnected5();

    if (connected.length > 0) {
      return true;
    }

    // 모든 그리드가 채워졌는지 확인
    const allFilled = grid.every(row => row.every(val => val >= 0));

    if (allFilled) {
      // 비김
      return true;
    } else {
      return false;
    }
  }

  public override async showGameFinishMessage(): Promise<void> {
    const players = this.players;
    const winner = this._getWinner();
    const lastGrid = this._drawFinishedBoard(winner);

    await this.sender.sendObject({
      content: GAME.WINNER_HEADER(players.map(({ user }) => user), winner),
      embeds: [lastGrid.build()]
    });
  }

  public override async showSurrenderMessage(): Promise<void> {
    const lastGrid = this._drawFinishedBoard(this.getOpponentIndex());

    await this.sender.sendObject({
      content: GAME.END_BY_SURRENDER(this.currentPlayer.user),
      embeds: [lastGrid.build()]
    });
  }

  public override async showTimeoutMessage(): Promise<void> {
    const lastGrid = this._drawFinishedBoard(this.getOpponentIndex());

    await this.sender.sendObject({
      content: GAME.END_BY_TIME,
      embeds: [lastGrid.build()]
    });
  }

  private _play(rowIdx: number, colIdx: number) {
    const grid = this._grid;
    const lastPlayed = this._lastPlayed;
    const playerIdx = this.currentPlayer.index;

    lastPlayed[0] = rowIdx;
    lastPlayed[1] = colIdx;
    grid[rowIdx][colIdx] = playerIdx;
  }

  private _drawBoard(cursor: [number, number]) {
    const grid = this._grid;
    const lastPlayed = this._lastPlayed;
    const players = this.players;
    const playerIdx = this.currentPlayer.index;
    const embed = new EmbedBuilder();

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
    const players = this.players;
    const connected = this._findConnected5();
    const embed = new EmbedBuilder();

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

    const builder = new ButtonBuilder();
    [
      EMOJI.ARROW.NW,
      EMOJI.ARROW.N,
      EMOJI.ARROW.NE,
      EMOJI.ARROW.W,
      null,
      EMOJI.ARROW.E,
      EMOJI.ARROW.SW,
      EMOJI.ARROW.S,
      EMOJI.ARROW.SE
    ].forEach((emoji, idx) => {
      if (emoji) {
        const dirIdx = CONNECT5.DIR_INDEX_MAP[idx];
        const direction = CONNECT5.DIRECTIONS[dirIdx];

        const x = cursor[0] + direction[0];
        const y = cursor[1] + direction[1];

        builder.addButton({
          id: dirIdx.toString(),
          emoji,
          style: ButtonStyle.Secondary,
          disabled: !isBetween(x, 0, grid.length) || !isBetween(y, 0, grid.length)
        });
      } else {
        builder.addButton({
          id: GAME.SYMBOL.SELECT,
          emoji: EMOJI.GREEN_CHECK,
          style: ButtonStyle.Secondary,
          disabled: grid[cursor[0]][cursor[1]] >= 0
        });
      }

      if (idx % 3 === 2) {
        builder.addSeparator();
      }
    });

    builder.addButton({
      label: GAME.SURRENDER,
      emoji: EMOJI.WHITE_FLAG,
      id: GAME.SYMBOL.GG,
      style: ButtonStyle.Danger
    });

    return builder;
  }
}

export { Connect5Game };
