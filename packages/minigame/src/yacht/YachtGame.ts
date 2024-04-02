import { ButtonBuilder } from "@siamese/button";
import { COLOR } from "@siamese/color";
import { EmbedBuilder } from "@siamese/embed";
import { EMOJI } from "@siamese/emoji";
import { type TextSender } from "@siamese/sender";
import { range } from "@siamese/util";
import { ButtonStyle } from "discord.js";

import VSGameLogic from "../VSGameLogic";
import { GAME } from "../const";

import TextBoard from "./TextBoard";
import TextDice from "./TextDice";
import { YACHT } from "./const";

import type { GameContext } from "../GameContext";
import type { PlayerActionParams, PlayerFinalActionParams } from "../types";

class YachtGame extends VSGameLogic {
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

  private _dice: TextDice;

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

  public constructor(ctx: GameContext) {
    super({
      ctx,
      randomizeFirstPlayer: true,
      maxWaitTime: 10 * 60 // 10분
    });

    this._singles = range(6).map(() => [-1, -1]);
    this._choice = [-1, -1];
    this._fourOfKind = [-1, -1];
    this._fullHouse = [-1, -1];
    this._smallStraight = [-1, -1];
    this._largeStraight = [-1, -1];
    this._yacht = [-1, -1];

    this._dice = new TextDice(5);

    this._turnInfo = this._newTurn();
  }

  public override async showCurrentBoard(): Promise<TextSender[]> {
    const sender = this.sender;
    const currentPlayer = this.currentPlayer;
    const boardEmbed = this._draw(currentPlayer.index);
    const selectBtns = this._getScoreButtons();

    const boardMsg = await sender.sendObject({
      embeds: [boardEmbed.build()],
      components: selectBtns.build()
    });

    const diceEmbed = new EmbedBuilder();
    const diceButtons = this._getDiceButtons();

    if (currentPlayer.index === 0) {
      diceEmbed.setColor(COLOR.ORANGE);
    } else {
      diceEmbed.setColor(COLOR.BLUE);
    }

    diceEmbed.setDescription(YACHT.TURN_HEADER(currentPlayer.user));

    const diceMsg = await sender.sendObject({
      content: currentPlayer.user.toString(),
      embeds: [diceEmbed.build()],
      components: diceButtons.build()
    });

    return [boardMsg, diceMsg];
  }

  public override async onPlayerAction({ id, sender, interaction, messages, stop }: PlayerActionParams): Promise<void> {
    if (id.startsWith(YACHT.SYMBOL.EYE)) {
      const locked = this._turnInfo.locked;
      const diceIdx = parseFloat(interaction.customId.substring(YACHT.SYMBOL.EYE.length));

      locked[diceIdx] = !locked[diceIdx];

      await sender.editObject({
        components: this._getDiceButtons().build()
      });
    } else if (id === YACHT.SYMBOL.ROLL) {
      const boardMsg = messages[0];
      if (this._turnInfo.locked.every(lock => lock)) {
        await sender.replyError(YACHT.ALL_LOCKED);
        return;
      }

      this._rollDice();

      await Promise.all([
        sender.editObject({
          components: this._getDiceButtons().build()
        }),
        boardMsg.editObject({
          components: this._getScoreButtons().build()
        })
      ]);
    } else {
      // 점수 버튼 선택
      stop(GAME.SYMBOL.NEXT_TURN);
    }
  }

  public override async onPlayerFinalAction({ id }: PlayerFinalActionParams): Promise<void> {
    this._updateScore(parseFloat(id));

    this._turnInfo = this._newTurn();
  }

  public override async onPlayerAFK(): Promise<void> {
    this.finishGameByTimeout();
  }

  public override checkGameFinished(): boolean {
    return [...this._singles, ...this.specials].every(([v1, v2]) => v1 >= 0 && v2 >= 0);
  }

  public override async showGameFinishMessage(): Promise<void> {
    const sender = this.sender;
    const players = this.players;
    const users = players.map(({ user }) => user);
    const winner = this._getWinner();
    const winnerEmbed = this._draw(winner);

    if (players[winner]) {
      winnerEmbed.setAuthor({
        name: GAME.WINNER_HEADER(users, winner),
        iconURL: users[winner].displayAvatarURL()
      });
    } else {
      winnerEmbed.setTitle(GAME.WINNER_HEADER(users, winner));
    }

    await sender.send(winnerEmbed);
  }

  public override async showSurrenderMessage(): Promise<void> {
    const sender = this.sender;

    await sender.sendObject({
      embeds: [this._draw(this.getOpponentIndex()).build()],
      content: GAME.END_BY_SURRENDER(this.currentPlayer.user)
    });
  }

  public override async showTimeoutMessage(): Promise<void> {
    const sender = this.sender;

    await sender.sendObject({
      embeds: [this._draw(this.getOpponentIndex()).build()],
      content: GAME.END_BY_TIME
    });
  }

  private _newTurn() {
    const { eyes } = this._dice.roll();

    return {
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

  private _updateScore(scoreIdx: number) {
    const scores = this._getPossibleScores();
    const score = scores[scoreIdx];
    const playerIdx = this.currentPlayer.index;

    [
      ...this._singles,
      ...this.specials
    ][scoreIdx][playerIdx] = score;
  }

  private _draw(playerIdx: number) {
    const players = this.players;
    const users = players.map(({ user }) => user);
    const embed = new EmbedBuilder();
    const board = new TextBoard({ paddingLeft: 0, paddingRight: 0 });
    const parseScore = (score: number) => score < 0 ? "" : score.toString();
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
    const buttons = new ButtonBuilder();
    const playerIdx = this.currentPlayer.index;
    const scores = [...this._singles, ...this.specials].map(score => score[playerIdx]);
    const possibleScores = this._getPossibleScores();

    for (let idx = 0; idx < 12; idx++) {
      const currentScore = scores[idx];
      const possibleScore = possibleScores[idx];

      buttons.addButton({
        id: idx.toString(),
        label: currentScore >= 0
          ? YACHT.NAMES[idx]
          : `${YACHT.NAMES[idx]}: ${possibleScore}`,
        emoji: currentScore < 0 && possibleScore > 0
          ? EMOJI.STAR
          : null,
        style: ButtonStyle.Secondary,
        disabled: currentScore >= 0
      });
    }

    buttons.addButton({
      id: GAME.SYMBOL.GG,
      label: GAME.SURRENDER,
      emoji: EMOJI.WHITE_FLAG,
      style: ButtonStyle.Danger
    });

    return buttons;
  }

  private _getDiceButtons() {
    const {
      eyes,
      locked,
      rerollLeft
    } = this._turnInfo;
    const buttons = new ButtonBuilder();

    eyes.forEach((eye, idx) => {
      const isLocked = locked[idx];

      buttons.addButton({
        id: `${YACHT.SYMBOL.EYE}${idx}`,
        label: eye.toString(),
        style: ButtonStyle.Secondary,
        emoji: isLocked ? EMOJI.LOCKED : EMOJI.DICE,
        disabled: rerollLeft <= 0
      });
    });

    buttons.addSeparator();

    buttons.addButton({
      id: YACHT.SYMBOL.ROLL,
      label: YACHT.LABEL.ROLL(rerollLeft),
      disabled: rerollLeft <= 0,
      style: rerollLeft <= 0 ? ButtonStyle.Secondary : ButtonStyle.Success,
      emoji: EMOJI.ROTATE
    });

    return buttons;
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
}

export { YachtGame };
