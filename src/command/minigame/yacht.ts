import Discord, { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import PhraseGen from "korean-random-words";

import { createGameChannel, getOpponent } from "./utils";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import * as COLOR from "~/const/color";
import * as ERROR from "~/const/error";
import * as EMOJI from "~/const/emoji";
import * as PERMISSION from "~/const/permission";
import { GAME, YACHT } from "~/const/command/minigame";
import { range } from "~/util/helper";
import TextBoard from "~/core/TextBoard";
import TextDice from "~/core/TextDice";

export default new Command({
  name: YACHT.CMD,
  description: YACHT.DESC,
  usage: YACHT.USAGE,
  alias: YACHT.ALIAS,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.CREATE_PUBLIC_THREADS,
    PERMISSION.SEND_MESSAGES_IN_THREADS,
    PERMISSION.MANAGE_THREADS
  ],
  cooldown: Cooldown.PER_USER(10),
  slashData: new SlashCommandBuilder()
    .setName(YACHT.CMD)
    .setDescription(YACHT.DESC)
    .addUserOption(option => option
      .setName(YACHT.USAGE_SLASH)
      .setDescription(YACHT.DESC_SLASH)
      .setRequired(true)
    ) as SlashCommandBuilder,
  sendTyping: false,
  execute: async ctx => {
    const { bot, author, channel } = ctx;

    if (channel.isThread()) {
      return await bot.replyError(ctx, ERROR.CMD.ONLY_IN_TEXT_CHANNEL);
    }

    const opponent = getOpponent(ctx, YACHT.USAGE_SLASH);
    if (!opponent) return;

    const players = [author, opponent];

    const game = new YachtGame(players);

    const threadChannel = await createGameChannel(ctx, YACHT.CMD, players, game.id);

    const nextTurn = async (playerIdx: number, prevInteraction: Discord.MessageComponentInteraction | null) => {
      const send = prevInteraction
        ? prevInteraction.reply.bind(prevInteraction)
        : threadChannel.send.bind(threadChannel);
      const finished = game.isFinished();

      if (finished) {
        const { total } = game.getScores();
        const winner = total[0] > total[1]
          ? 0
          : total[1] > total[0]
            ? 1
            : -1;

        const winnerEmbed = game.draw(winner);

        if (players[winner]) {
          winnerEmbed.setAuthor({
            name: GAME.WINNER_HEADER(players, winner),
            iconURL: players[winner].displayAvatarURL()
          });
        } else {
          winnerEmbed.setTitle(GAME.WINNER_HEADER(players, winner));
        }

        await send({
          embeds: [winnerEmbed]
        });

        await threadChannel.setLocked(true).catch(() => void 0);
        await threadChannel.setArchived(true).catch(() => void 0);
      } else {
        const opponentIdx = 1 - playerIdx;
        const boardEmbed = game.draw(playerIdx);
        const selectBtns = game.getScoreButtons(playerIdx);

        const boardMsg = await send({
          embeds: [boardEmbed],
          components: selectBtns,
          fetchReply: true
        });

        const followUp = prevInteraction
          ? prevInteraction.followUp.bind(prevInteraction)
          : threadChannel.send.bind(threadChannel);

        const diceEmbed = new MessageEmbed();
        const diceButtons = game.getDiceButtons();

        if (playerIdx === 0) {
          diceEmbed.setColor(COLOR.ORANGE);
        } else {
          diceEmbed.setColor(COLOR.BLUE);
        }

        diceEmbed.setDescription(YACHT.TURN_HEADER(players[playerIdx]));

        const diceMsg = await followUp({
          content: players[playerIdx].toString(),
          embeds: [diceEmbed],
          components: diceButtons,
          fetchReply: true
        });

        const collector = threadChannel.createMessageComponentCollector({
          filter: interaction => {
            return interaction.message.id === diceMsg.id
              || interaction.message.id === boardMsg.id;
          },
          time: 1000 * 3600, // 1 hour
          dispose: true
        });

        collector.on("collect", async interaction => {
          if (interaction.user.id !== players[playerIdx].id) {
            if (interaction.user.id === players[opponentIdx].id) {
              await interaction.reply({ content: GAME.NOT_YOUR_TURN, ephemeral: true });
            } else {
              await interaction.reply({ content: GAME.NOT_IN_GAME, ephemeral: true });
            }
            return;
          }

          // Lock / Unlock dice
          if (interaction.customId.startsWith(YACHT.SYMBOL.EYE)) {
            const locked = game.turnInfo.locked;
            const diceIdx = parseFloat(interaction.customId.substring(YACHT.SYMBOL.EYE.length));

            locked[diceIdx] = !locked[diceIdx];

            await interaction.update({
              components: game.getDiceButtons()
            });
          } else if (interaction.customId === YACHT.SYMBOL.ROLL) {
            if (game.turnInfo.locked.every(lock => lock)) {
              return interaction.reply(YACHT.ALL_LOCKED).catch(() => void 0);
            }

            game.rollDice();

            await Promise.all([
              interaction.update({
                embeds: [diceEmbed],
                components: game.getDiceButtons()
              }).catch(() => void 0),
              boardMsg.edit({
                components: game.getScoreButtons(playerIdx)
              }).catch(() => void 0)
            ]);
          } else if (interaction.customId === YACHT.SYMBOL.GG) {
            return collector.stop(YACHT.SYMBOL.GG);
          } else {
            // Update Score
            const scoreIndex = interaction.customId;
            game.updateScore(playerIdx, scoreIndex);
            game.newTurn();
            collector.stop(YACHT.SYMBOL.NEXT_TURN);
            void nextTurn(opponentIdx, interaction);
          }
        });

        collector.on("end", async (collected, reason) => {
          if (reason === YACHT.SYMBOL.NEXT_TURN) return;

          if (reason === YACHT.SYMBOL.GG) {
            const lastInteraction = collected.last()!;
            await lastInteraction.reply({
              embeds: [game.draw(opponentIdx)],
              content: GAME.END_BY_SURRENDER(lastInteraction.member as Discord.GuildMember)
            }).catch(() => void 0);
          } else {
            await threadChannel.send({
              embeds: [game.draw(-1)],
              content: GAME.END_BY_TIME
            }).catch(() => void 0);
          }

          await threadChannel.setLocked(true).catch(() => void 0);
          await threadChannel.setArchived(true).catch(() => void 0);
        });
      }
    };

    void nextTurn(Math.round(Math.random()), null);
  }
});

class YachtGame {
  public id: string;
  public singles: Array<[number, number]>;
  public choice: [number, number];
  public fourOfKind: [number, number];
  public fullHouse: [number, number];
  public smallStraight: [number, number];
  public largeStraight: [number, number];
  public yacht: [number, number];

  public turnInfo: {
    rerollLeft: number;
    eyes: number[];
    locked: boolean[];
  };

  private _players: Discord.GuildMember[];
  private _dice: TextDice;

  public get specials() {
    return [
      this.choice,
      this.fourOfKind,
      this.fullHouse,
      this.smallStraight,
      this.largeStraight,
      this.yacht
    ];
  }

  public constructor(players: Discord.GuildMember[]) {
    this._players = players;

    this.id = new PhraseGen().generatePhrase();
    this.singles = range(6).map(() => [-1, -1]);
    this.choice = [-1, -1];
    this.fourOfKind = [-1, -1];
    this.fullHouse = [-1, -1];
    this.smallStraight = [-1, -1];
    this.largeStraight = [-1, -1];
    this.yacht = [-1, -1];

    this._dice = new TextDice(5);

    this.newTurn();
  }

  public newTurn() {
    const { eyes } = this._dice.roll();

    this.turnInfo = {
      rerollLeft: 2,
      eyes,
      locked: eyes.map(() => false)
    };
  }

  public rollDice() {
    const {
      eyes: prevEyes,
      locked
    } = this.turnInfo;
    const { eyes } = this._dice.roll(prevEyes, locked);

    this.turnInfo = {
      rerollLeft: this.turnInfo.rerollLeft - 1,
      eyes,
      locked: eyes.map(() => false)
    };
  }

  public updateScore(playerIdx: number, scoreIdx: string) {
    const scores = this.getPossibleScores();
    const score = scores[scoreIdx];

    [
      ...this.singles,
      ...this.specials
    ][scoreIdx][playerIdx] = score;
  }

  public draw(playerIdx: number) {
    const players = this._players;
    const embed = new MessageEmbed();
    const board = new TextBoard({ paddingLeft: 0, paddingRight: 0 });
    const parseScore = score => score < 0 ? "" : score.toString();
    const singles = this.singles.map(single => single.map(val => parseScore(val)));
    const { subtotal, total } = this.getScores();
    const singlesAllFilled = range(2).map(idx => {
      return this.singles.every(single => single[idx] >= 0);
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
    board.add(YACHT.NAMES[6], this.choice.map(val => parseScore(val)));
    board.addSeparator();
    board.add(YACHT.NAMES[7], this.fourOfKind.map(val => parseScore(val)));
    board.add(YACHT.NAMES[8], this.fullHouse.map(val => parseScore(val)));
    board.add(YACHT.NAMES[9], this.smallStraight.map(val => parseScore(val)));
    board.add(YACHT.NAMES[10], this.largeStraight.map(val => parseScore(val)));
    board.add(YACHT.NAMES[11], this.yacht.map(val => parseScore(val)));
    board.addSeparator();
    board.add("Total", total.map(val => val.toString()));
    board.addFooter(`${EMOJI.SMALL_ORANGE_DIAMOND} P1: ${players[0].displayName}\n${EMOJI.SMALL_BLUE_DIAMOND} P2: ${players[1].displayName}`);

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

  public getScoreButtons(playerIdx: number) {
    const scores = [...this.singles, ...this.specials].map(score => score[playerIdx]);
    const rows = range(3).map(() => new MessageActionRow());
    const possibleScores = this.getPossibleScores();

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

  public getDiceButtons() {
    const {
      eyes,
      locked,
      rerollLeft
    } = this.turnInfo;
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

  public isFinished(): boolean {
    return [...this.singles, ...this.specials].every(([v1, v2]) => v1 >= 0 && v2 >= 0);
  }

  public getScores() {
    const subtotal = this.singles.reduce((score, single) => {
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

  public getPossibleScores() {
    const eyes = this.turnInfo.eyes;
    const singlesScores = this.singles.map((_, idx) => {
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
