import { ButtonBuilder } from "@siamese/button";
import { EmbedBuilder } from "@siamese/embed";
import { EMOJI } from "@siamese/emoji";
import { getRandom, isBetween, range } from "@siamese/util";
import { ButtonStyle } from "discord.js";

import VSGameLogic from "../VSGameLogic";
import { GAME } from "../const";

import { CONNECT4 } from "./const";

import type { GameContext } from "../GameContext";
import type { VSPlayerActionParams, VSPlayerFinalActionParams } from "../types";

class Connect4Game extends VSGameLogic {
  private _grid: number[][];
  private _lastPlayed: [number, number];

  public constructor(ctx: GameContext) {
    super({
      ctx,
      randomizeFirstPlayer: true,
      maxWaitTime: 60
    });

    this._grid = range(6).map(() => [...range(7).map(() => -1)]);
    this._lastPlayed = [-1, -1];
  }

  public override async showCurrentBoard() {
    const grid = this._grid;
    const lastPlayed = this._lastPlayed;
    const players = this.players;
    const currentPlayer = this.currentPlayer;
    const embed = new EmbedBuilder();

    const lines: string[] = [];

    // 현재 돌 상태
    grid.forEach((line, rowIdx) => {
      lines.push(line.map((val, colIdx) => {
        return (rowIdx === lastPlayed[0] && colIdx === lastPlayed[1])
          ? CONNECT4.CIRCLE[val + 2]
          : CONNECT4.CIRCLE[val];
      }).join(" "));
    });

    // 제일 하단의 한줄에는 숫자 이모지를 표시함
    lines.push(range(grid[0].length).map(idx => `${idx + 1}${EMOJI.KEYCAP}`).join(" "));

    // 빈 줄
    lines.push("");

    // 어떤 플레이어가 어떤 돌을 사용하는지 매치
    players.forEach((player, idx) => {
      lines.push(`${CONNECT4.CIRCLE[idx]}: ${player.user.displayName}`);
    });

    embed.setDescription(lines.join("\n"));
    embed.setColor(CONNECT4.PIECE_COLOR[currentPlayer.index]);

    const buttons = this._createButtons();

    return [await this.sender.sendObject({
      content: CONNECT4.TURN_HEADER(this.currentPlayer.user, this.currentPlayer.index),
      embeds: [embed.build()],
      components: buttons.build()
    })];
  }

  public override async onPlayerAction({ stop }: VSPlayerActionParams): Promise<void> {
    stop(GAME.SYMBOL.NEXT_TURN);
  }

  public override async onPlayerFinalAction({ id }: VSPlayerFinalActionParams): Promise<void> {
    const colIdx = parseFloat(id);
    this._play(colIdx);
  }

  public override async onPlayerAFK(): Promise<void> {
    // 임의의 열을 지정해서 플레이
    const grid = this._grid;
    const possibleColumns = range(7).filter(colIdx => {
      const colFilled = grid.every(row => row[colIdx] >= 0);
      return !colFilled;
    });

    const randomCol = getRandom(possibleColumns);
    this._play(randomCol);
  }

  public override checkGameFinished(): boolean {
    const grid = this._grid;
    const connected4 = this._findConnected4();

    // 4개 이상인 줄이 하나라도 있을 경우
    if (connected4.length > 0) {
      return true;
    }

    // 모든 그리드가 칠해졌을 경우
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
    // 시간초과 케이스는 존재하지 않으므로 아무것도 하지 않음
  }

  private _play(colIdx: number) {
    const grid = this._grid;
    const lastPlayed = this._lastPlayed;
    const playerIdx = this.currentPlayer.index;

    for (let rowIdx = grid.length - 1; rowIdx >= 0; rowIdx--) {
      if (grid[rowIdx][colIdx] < 0) {
        grid[rowIdx][colIdx] = playerIdx;
        lastPlayed[0] = rowIdx;
        lastPlayed[1] = colIdx;
        break;
      }
    }
  }

  private _drawFinishedBoard(winner: number) {
    const grid = this._grid;
    const players = this.players;
    const connected4 = this._findConnected4();
    const embed = new EmbedBuilder();

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
    embed.setColor(CONNECT4.PIECE_COLOR[winner]);

    return embed;
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

    const buttons = new ButtonBuilder();

    range(7).forEach(idx => {
      const colFilled = grid.every(row => row[idx] >= 0);

      buttons.addButton({
        id: idx.toString(),
        emoji: `${idx + 1}${EMOJI.KEYCAP}`,
        style: ButtonStyle.Secondary,
        disabled: colFilled
      });
    });

    buttons.addButton({
      label: GAME.SURRENDER,
      emoji: EMOJI.WHITE_FLAG,
      id: GAME.SYMBOL.GG,
      style: ButtonStyle.Danger
    });

    return buttons;
  }
}

export { Connect4Game };
