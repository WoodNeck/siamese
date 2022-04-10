import { MessageActionRow, MessageButton, MessageEmbed, ThreadChannel } from "discord.js";

import VsGameRoom from "../VsGameRoom";

import { GAME, OTHELLO } from "~/const/command/minigame";
import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import { getRandom, range } from "~/util/helper";
import { blockOtherInteractions } from "~/command/minigame/utils";

class OthelloGame {
  private _threadChannel: ThreadChannel;
  private _players: VsGameRoom["players"];

  private _grid: number[][];
  private _changes: number[][];
  private _playerIdx: number;
  private _ggFlag: boolean;

  public constructor(players: VsGameRoom["players"], threadChannel: ThreadChannel) {
    this._players = players;
    this._threadChannel = threadChannel;

    this._grid = range(8).map(() => [...range(8).map(() => -1)]);
    this._grid[3][3] = 1;
    this._grid[3][4] = 0;
    this._grid[4][3] = 0;
    this._grid[4][4] = 1;
    this._changes = range(8).map(() => [...range(8).map(() => -1)]);

    this._playerIdx = Math.round(Math.random());
    this._ggFlag = false;
  }

  public async start() {
    let candidatesInfo = this._calcCandidates();

    while (!candidatesInfo.finished && !this._ggFlag) {
      this._playerIdx = 1 - this._playerIdx;
      await this._nextTurn(candidatesInfo);
      candidatesInfo = this._calcCandidates();
    }

    if (this._ggFlag) {
      await this._showGGMessage();
    } else {
      await this._showGameFinishMessage();
    }

    await this.destroy();
  }

  public async destroy() {
    const threadChannel = this._threadChannel;

    await threadChannel.setLocked(true).catch(() => void 0);
    await threadChannel.setArchived(true).catch(() => void 0);
  }

  private async _nextTurn({ candidates, markerCount }: ReturnType<OthelloGame["_calcCandidates"]>) {
    const players = this._players;
    const playerIdx = this._playerIdx;
    const opponentIdx = 1 - playerIdx;
    const threadChannel = this._threadChannel;
    const buttonCount = Math.min(markerCount, 25);
    const rowCount = Math.floor((buttonCount - 1) / 5) + 1;
    const buttonRows = this._createButtons(rowCount, buttonCount, 0);

    const messages = [await threadChannel.send({
      ...this._drawPlayingGrid(candidates),
      components: buttonRows
    })];

    if (markerCount > 25) {
      const exceedRowCount = Math.floor((markerCount - 1) / 5) - 4;
      const exceedRows = this._createButtons(exceedRowCount, markerCount, 25);

      const exceedMsg = await threadChannel.send({
        components: exceedRows
      });

      messages.push(exceedMsg);
    }

    const candidatePositions = candidates.reduce((positions, row, rowIdx) => {
      const posMapped = row.map((val, colIdx) => val && [rowIdx, colIdx]).filter(val => !!val);
      return [...positions, ...posMapped];
    }, []) as Array<[number, number]>;

    const collector = threadChannel.createMessageComponentCollector({
      filter: interaction => messages.some(msg => msg.id === interaction.message.id),
      time: 60000, // 1 min
      dispose: true
    });

    collector.on("collect", async interaction => {
      const blocked = await blockOtherInteractions(interaction, players[playerIdx].user.id, players[opponentIdx].user.id);
      if (blocked) return;

      await interaction.update({ components: [] });

      if (interaction.customId === GAME.SYMBOL.GG) {
        collector.stop(GAME.SYMBOL.GG);
        return;
      }

      const [rowIdx, colIdx] = candidatePositions[interaction.customId];
      this._placeAtGrid(rowIdx, colIdx);

      collector.stop(GAME.SYMBOL.NEXT_TURN);
    });

    return new Promise<void>(resolve => {
      collector.on("end", async (_, reason) => {
        if (reason === GAME.SYMBOL.GG) {
          this._ggFlag = true;
          return resolve();
        }

        if (reason === GAME.SYMBOL.NEXT_TURN) return resolve();

        // Pick random
        const [rowIdx, colIdx] = getRandom(candidatePositions);
        this._placeAtGrid(rowIdx, colIdx);

        resolve();
      });
    });
  }

  private _drawPlayingGrid(candidates: Array<Array<string | null>>) {
    const embed = new MessageEmbed();
    const board = this._drawBoard(candidates);
    const [whiteCount, blackCount] = this._getDiscCount();
    const users = this._players.map(({ user }) => user);
    const playerIdx = this._playerIdx;

    embed.setDescription(board);
    embed.setColor(this._getPlayerColor(playerIdx));
    embed.addField(OTHELLO.FIELD_TITLE(users), OTHELLO.FIELD_DESC(users, whiteCount, blackCount));

    return {
      content: OTHELLO.TURN_HEADER(users[playerIdx], playerIdx),
      embeds: [embed]
    };
  }

  private _drawFinishedGrid() {
    const changes = this._changes;
    const embed = new MessageEmbed();
    const users = this._players.map(({ user }) => user);

    changes.forEach(row => {
      row.forEach((_, idx) => row[idx] = -1);
    });

    const board = this._drawBoard();
    const [whiteCount, blackCount] = this._getDiscCount();

    const winner = whiteCount > blackCount
      ? 0
      : blackCount > whiteCount
        ? 1
        : -1;

    const winnerColor = this._getPlayerColor(winner);

    embed.setDescription(board);
    embed.setColor(winnerColor);
    embed.addField(OTHELLO.FIELD_TITLE(users), OTHELLO.FIELD_DESC(users, whiteCount, blackCount));

    return {
      content: GAME.WINNER_HEADER(users, winner),
      embeds: [embed]
    };
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

  private _createButtons(rowCount: number, buttonCount: number, markerOffset: number) {
    const buttonRows = range(rowCount)
      .map(rowIdx => {
        const row = new MessageActionRow();
        const buttons = range(rowIdx === rowCount - 1 ? (buttonCount - 1) % 5 + 1 : 5).map(colIdx => {
          const markerIndex = rowIdx * 5 + colIdx + markerOffset;
          const btn = new MessageButton();

          btn.setEmoji(OTHELLO.CANDIDATE_MARKERS[markerIndex]);
          btn.setCustomId(markerIndex.toString());
          btn.setStyle("SECONDARY");

          return btn;
        });

        row.addComponents(...buttons);

        return row;
      });

    const otherActions = new MessageActionRow();
    const ggButton = new MessageButton();

    ggButton.setLabel(GAME.SURRENDER);
    ggButton.setEmoji(EMOJI.WHITE_FLAG);
    ggButton.setCustomId(GAME.SYMBOL.GG);
    ggButton.setStyle("DANGER");
    otherActions.addComponents(ggButton);

    buttonRows.push(otherActions);

    return buttonRows;
  }

  private _placeAtGrid(x: number, y: number) {
    const grid = this._grid;
    const changes = this._changes;
    const playerIdx = this._playerIdx;
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

  private _calcCandidates() {
    const grid = this._grid;
    const playerIdx = this._playerIdx;

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
      markerCount: markerOffset,
      finished: markerOffset <= 0
    };
  }

  private async _showGameFinishMessage() {
    const threadChannel = this._threadChannel;

    await threadChannel.send({
      ...this._drawFinishedGrid()
    });
  }

  private async _showGGMessage() {
    const threadChannel = this._threadChannel;

    await threadChannel.send({
      ...this._drawFinishedGrid(),
      content: GAME.END_BY_SURRENDER(this._players[this._playerIdx].user)
    }).catch(() => void 0);
  }
}

export default OthelloGame;
