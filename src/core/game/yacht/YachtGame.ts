import { MessageActionRow, MessageButton, MessageEmbed, ThreadChannel } from "discord.js";

import VsGameRoom from "../VsGameRoom";

import TextBoard from "~/core/game/TextBoard";
import TextDice from "~/core/game/TextDice";
import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import { GAME, YACHT } from "~/const/command/minigame";
import { range } from "~/util/helper";
import { blockOtherInteractions } from "~/command/minigame/utils";

class YachtGame {
  private _singles: Array<[number, number]>;
  private _choice: [number, number];
  private _fourOfKind: [number, number];
  private _fullHouse: [number, number];
  private _smallStraight: [number, number];
  private _largeStraight: [number, number];
  private _yacht: [number, number];

  private _turnInfo: {
    rerollLeft: number;
    eyes: number[];
    locked: boolean[];
  };

  private _threadChannel: ThreadChannel;
  private _players: VsGameRoom["players"];

  private _dice: TextDice;
  private _playerIdx: number;
  private _ggFlag: boolean;
  private _timeoutFlag: boolean;

  public get specials() {
    return [
      this._choice,
      this._fourOfKind,
      this._fullHouse,
      this._smallStraight,
      this._largeStraight,
      this._yacht
    ];
  }

  public constructor(players: VsGameRoom["players"], threadChannel: ThreadChannel) {
    this._players = players;
    this._threadChannel = threadChannel;

    this._singles = range(6).map(() => [-1, -1]);
    this._choice = [-1, -1];
    this._fourOfKind = [-1, -1];
    this._fullHouse = [-1, -1];
    this._smallStraight = [-1, -1];
    this._largeStraight = [-1, -1];
    this._yacht = [-1, -1];

    this._dice = new TextDice(5);

    this._playerIdx = Math.round(Math.random());
    this._ggFlag = false;
    this._timeoutFlag = false;

    this._newTurn();
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
    const threadChannel = this._threadChannel;
    const players = this._players;
    const playerIdx = this._playerIdx;
    const opponentIdx = 1 - playerIdx;
    const boardEmbed = this._draw(playerIdx);
    const selectBtns = this._getScoreButtons();

    const boardMsg = await threadChannel.send({
      embeds: [boardEmbed],
      components: selectBtns
    });

    const diceEmbed = new MessageEmbed();
    const diceButtons = this._getDiceButtons();

    if (playerIdx === 0) {
      diceEmbed.setColor(COLOR.ORANGE);
    } else {
      diceEmbed.setColor(COLOR.BLUE);
    }

    diceEmbed.setDescription(YACHT.TURN_HEADER(players[playerIdx].user));

    const diceMsg = await threadChannel.send({
      content: players[playerIdx].user.toString(),
      embeds: [diceEmbed],
      components: diceButtons
    });

    const collector = threadChannel.createMessageComponentCollector({
      filter: interaction => {
        return interaction.message.id === diceMsg.id
          || interaction.message.id === boardMsg.id;
      },
      time: 1000 * 60 * 10, // 10 min
      dispose: true
    });

    collector.on("collect", async interaction => {
      const blocked = await blockOtherInteractions(interaction, players[playerIdx].user.id, players[opponentIdx].user.id);
      if (blocked) return;

      // Lock / Unlock dice
      if (interaction.customId.startsWith(YACHT.SYMBOL.EYE)) {
        const locked = this._turnInfo.locked;
        const diceIdx = parseFloat(interaction.customId.substring(YACHT.SYMBOL.EYE.length));

        locked[diceIdx] = !locked[diceIdx];

        await interaction.update({
          components: this._getDiceButtons()
        });
      } else if (interaction.customId === YACHT.SYMBOL.ROLL) {
        if (this._turnInfo.locked.every(lock => lock)) {
          return interaction.reply(YACHT.ALL_LOCKED).catch(() => void 0);
        }

        this._rollDice();

        await Promise.all([
          interaction.update({
            embeds: [diceEmbed],
            components: this._getDiceButtons()
          }).catch(() => void 0),
          boardMsg.edit({
            components: this._getScoreButtons()
          }).catch(() => void 0)
        ]);
      } else if (interaction.customId === YACHT.SYMBOL.GG) {
        await interaction.deferUpdate();
        return collector.stop(YACHT.SYMBOL.GG);
      } else {
        await interaction.deferUpdate();

        // Update Score
        const scoreIndex = interaction.customId;
        this._updateScore(scoreIndex);
        this._newTurn();
        collector.stop(YACHT.SYMBOL.NEXT_TURN);
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

  private _newTurn() {
    const { eyes } = this._dice.roll();

    this._turnInfo = {
      rerollLeft: 2,
      eyes,
      locked: eyes.map(() => false)
    };
  }

  private _rollDice() {
    const {
      eyes: prevEyes,
      locked
    } = this._turnInfo;
    const { eyes } = this._dice.roll(prevEyes, locked);

    this._turnInfo = {
      rerollLeft: this._turnInfo.rerollLeft - 1,
      eyes,
      locked: eyes.map(() => false)
    };
  }

  private _updateScore(scoreIdx: string) {
    const scores = this._getPossibleScores();
    const score = scores[scoreIdx];
    const playerIdx = this._playerIdx;

    [
      ...this._singles,
      ...this.specials
    ][scoreIdx][playerIdx] = score;
  }

  private _draw(playerIdx: number) {
    const players = this._players;
    const users = players.map(({ user }) => user);
    const embed = new MessageEmbed();
    const board = new TextBoard({ paddingLeft: 0, paddingRight: 0 });
    const parseScore = score => score < 0 ? "" : score.toString();
    const singles = this._singles.map(single => single.map(val => parseScore(val)));
    const { subtotal, total } = this._getScores();
    const singlesAllFilled = range(2).map(idx => {
      return this._singles.every(single => single[idx] >= 0);
    });
    const bonusText = singlesAllFilled.map((filled, idx) => {
      if (filled) {
        return subtotal[idx] >= 63 ? "+35" : "+0";
      } else {
        return "";
      }
    });

    board.add("", ["P1", "P2"]);
    board.addSeparator();
    board.add(YACHT.NAMES[0], singles[0]);
    board.add(YACHT.NAMES[1], singles[1]);
    board.add(YACHT.NAMES[2], singles[2]);
    board.add(YACHT.NAMES[3], singles[3]);
    board.add(YACHT.NAMES[4], singles[4]);
    board.add(YACHT.NAMES[5], singles[5]);
    board.addSeparator();
    board.add("Subtotal", subtotal.map(val => val.toString()));
    board.add("", [`${EMOJI.FIGURE_SPACE}/63`, `${EMOJI.FIGURE_SPACE}/63`]);
    board.add(`+35${EMOJI.FIGURE_SPACE}Bonus`, bonusText);
    board.addSeparator();
    board.add(YACHT.NAMES[6], this._choice.map(val => parseScore(val)));
    board.addSeparator();
    board.add(YACHT.NAMES[7], this._fourOfKind.map(val => parseScore(val)));
    board.add(YACHT.NAMES[8], this._fullHouse.map(val => parseScore(val)));
    board.add(YACHT.NAMES[9], this._smallStraight.map(val => parseScore(val)));
    board.add(YACHT.NAMES[10], this._largeStraight.map(val => parseScore(val)));
    board.add(YACHT.NAMES[11], this._yacht.map(val => parseScore(val)));
    board.addSeparator();
    board.add("Total", total.map(val => val.toString()));
    board.addFooter(`${EMOJI.SMALL_ORANGE_DIAMOND} P1: ${users[0].displayName}\n${EMOJI.SMALL_BLUE_DIAMOND} P2: ${users[1].displayName}`);

    embed.setDescription(board.draw());

    if (playerIdx === 0) {
      embed.setColor(COLOR.ORANGE);
    } else if (playerIdx === 1) {
      embed.setColor(COLOR.BLUE);
    } else {
      embed.setColor(COLOR.BLACK); // Draw
    }

    return embed;
  }

  private _getScoreButtons() {
    const playerIdx = this._playerIdx;
    const scores = [...this._singles, ...this.specials].map(score => score[playerIdx]);
    const rows = range(3).map(() => new MessageActionRow());
    const possibleScores = this._getPossibleScores();

    range(12).forEach(idx => {
      const currentScore = scores[idx];
      const possibleScore = possibleScores[idx];
      const row = rows[Math.floor(idx / 5)];
      const btn = new MessageButton();

      btn.setCustomId(idx.toString());

      if (currentScore >= 0) {
        btn.setDisabled(true);
        btn.setLabel(YACHT.NAMES[idx]);
      } else {
        btn.setLabel(`${YACHT.NAMES[idx]}: ${possibleScore}`);
        if (possibleScore > 0) {
          btn.setEmoji(EMOJI.STAR);
        }
      }
      btn.setStyle("SECONDARY");

      row.addComponents(btn);
    });

    const surrenderBtn = new MessageButton();
    surrenderBtn.setLabel(GAME.SURRENDER);
    surrenderBtn.setEmoji(EMOJI.WHITE_FLAG);
    surrenderBtn.setStyle("DANGER");
    surrenderBtn.setCustomId(YACHT.SYMBOL.GG);

    rows[2].addComponents(surrenderBtn);

    return rows;
  }

  private _getDiceButtons() {
    const {
      eyes,
      locked,
      rerollLeft
    } = this._turnInfo;
    const diceRow = new MessageActionRow();
    const actionRow = new MessageActionRow();

    eyes.forEach((eye, idx) => {
      const isLocked = locked[idx];
      const btn = new MessageButton();

      btn.setCustomId(`${YACHT.SYMBOL.EYE}${idx}`);
      btn.setLabel(eye.toString());
      btn.setStyle("SECONDARY");

      if (isLocked) {
        btn.setEmoji(EMOJI.LOCKED);
      } else {
        btn.setEmoji(EMOJI.DICE);
      }

      if (rerollLeft <= 0) {
        btn.setDisabled(true);
      }

      diceRow.addComponents(btn);
    });

    const rollBtn = new MessageButton();

    rollBtn.setCustomId(YACHT.SYMBOL.ROLL);
    rollBtn.setLabel(YACHT.LABEL.ROLL(rerollLeft));

    if (rerollLeft <= 0) {
      rollBtn.setDisabled(true);
      rollBtn.setStyle("SECONDARY");
    } else {
      rollBtn.setStyle("SUCCESS");
    }

    rollBtn.setEmoji(EMOJI.ROTATE);

    actionRow.addComponents(rollBtn);

    return [diceRow, actionRow];
  }

  private _isFinished(): boolean {
    return [...this._singles, ...this.specials].every(([v1, v2]) => v1 >= 0 && v2 >= 0);
  }

  private _getWinner(): number {
    const { total } = this._getScores();
    return total[0] > total[1]
      ? 0
      : total[1] > total[0]
        ? 1
        : -1;
  }

  private _getScores() {
    const subtotal = this._singles.reduce((score, single) => {
      score[0] += Math.max(single[0], 0);
      score[1] += Math.max(single[1], 0);
      return score;
    }, [0, 0]);
    const total = this.specials.reduce((score, single) => {
      score[0] += Math.max(single[0], 0);
      score[1] += Math.max(single[1], 0);
      return score;
    }, [0, 0]);
    total[0] += subtotal[0];
    total[1] += subtotal[1];

    subtotal.forEach((score, idx) => {
      if (score >= 63) total[idx] += 35;
    });

    return {
      subtotal,
      total
    };
  }

  private _getPossibleScores() {
    const eyes = this._turnInfo.eyes;
    const singlesScores = this._singles.map((_, idx) => {
      return eyes.reduce((total, eye) => {
        if (eye !== idx + 1) return total;
        else return total + eye;
      }, 0);
    });

    const eyesCount = this._getEyesCount(eyes);

    const specialsScores = [
      this._eyesSum(eyes), // Choice
      this._fourOfAKindScore(eyes, eyesCount),
      this._fullHouseScore(eyes, eyesCount),
      this._smallStraightScore(eyesCount),
      this._largeStraightScore(eyesCount),
      this._yachtScore(eyesCount)
    ];

    return [...singlesScores, ...specialsScores];
  }

  private _eyesSum(eyes: number[]) {
    return eyes.reduce((total, eye) => total + eye, 0);
  }

  private _fourOfAKindScore(eyes: number[], eyesCount: number[]) {
    if (eyesCount.some(count => count >= 4)) {
      return this._eyesSum(eyes);
    } else {
      return 0;
    }
  }

  private _fullHouseScore(eyes: number[], eyesCount: number[]) {
    const haveTriple = eyesCount.some(count => count === 3);
    const haveDouble = eyesCount.some(count => count === 2);

    if (haveTriple && haveDouble) {
      return this._eyesSum(eyes);
    } else {
      return 0;
    }
  }

  private _smallStraightScore(eyesCount: number[]) {
    const have3 = eyesCount[2] > 0;
    const have4 = eyesCount[3] > 0;

    if (!have3 || !have4) return 0;

    const have1 = eyesCount[0] > 0;
    const have2 = eyesCount[1] > 0;
    const have5 = eyesCount[4] > 0;
    const have6 = eyesCount[5] > 0;

    if (
      (have1 && have2)
      || (have2 && have5)
      || (have5 && have6)
    ) {
      return 15;
    } else {
      return 0;
    }
  }

  private _largeStraightScore(eyesCount: number[]) {
    const haveMiddle = eyesCount[1] > 0
      && eyesCount[2] > 0
      && eyesCount[3] > 0
      && eyesCount[4] > 0;

    if (!haveMiddle) return 0;

    const have1 = eyesCount[0] > 0;
    const have6 = eyesCount[5] > 0;

    if (have1 || have6) return 30;
    else return 0;
  }

  private _yachtScore(eyesCount: number[]) {
    const haveYacht = eyesCount.some(count => count === 5);

    if (haveYacht) return 50;
    else return 0;
  }

  private _getEyesCount(eyes: number[]) {
    const eyesCount = range(6).map(() => 0);
    eyes.forEach(eye => {
      eyesCount[eye - 1] += 1;
    });

    return eyesCount;
  }

  private async _showGameFinishMessage(winner: number) {
    const threadChannel = this._threadChannel;
    const players = this._players;
    const users = players.map(({ user }) => user);

    const winnerEmbed = this._draw(winner);

    if (players[winner]) {
      winnerEmbed.setAuthor({
        name: GAME.WINNER_HEADER(users, winner),
        iconURL: users[winner].displayAvatarURL()
      });
    } else {
      winnerEmbed.setTitle(GAME.WINNER_HEADER(users, winner));
    }

    await threadChannel.send({
      embeds: [winnerEmbed]
    });
  }

  private async _showGGMessage() {
    const threadChannel = this._threadChannel;
    const playerIdx = this._playerIdx;

    await threadChannel.send({
      embeds: [this._draw(1 - playerIdx)],
      content: GAME.END_BY_SURRENDER(this._players[playerIdx].user)
    }).catch(() => void 0);
  }

  private async _showTimeoutMessage() {
    const threadChannel = this._threadChannel;

    await threadChannel.send({
      embeds: [this._draw(1 - this._playerIdx)],
      content: GAME.END_BY_TIME
    }).catch(() => void 0);
  }
}

export default YachtGame;
