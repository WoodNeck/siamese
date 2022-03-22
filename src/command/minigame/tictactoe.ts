import Discord, { MessageActionRow, MessageButton } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import PhraseGen from "korean-random-words";

import { create1vs1GameChannel, getOpponent } from "./utils";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import * as ERROR from "~/const/error";
import * as EMOJI from "~/const/emoji";
import * as PERMISSION from "~/const/permission";
import { GAME, TICTACTOE } from "~/const/command/minigame";
import { range } from "~/util/helper";

export default new Command({
  name: TICTACTOE.CMD,
  description: TICTACTOE.DESC,
  usage: TICTACTOE.USAGE,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.CREATE_PUBLIC_THREADS,
    PERMISSION.SEND_MESSAGES_IN_THREADS,
    PERMISSION.MANAGE_THREADS
  ],
  cooldown: Cooldown.PER_USER(10),
  slashData: new SlashCommandBuilder()
    .setName(TICTACTOE.CMD)
    .setDescription(TICTACTOE.DESC)
    .addUserOption(option => option
      .setName(TICTACTOE.USAGE_SLASH)
      .setDescription(TICTACTOE.DESC_SLASH)
      .setRequired(true)
    ) as SlashCommandBuilder,
  sendTyping: false,
  execute: async ctx => {
    const { bot, author, channel } = ctx;

    if (channel.isThread()) {
      return await bot.replyError(ctx, ERROR.CMD.ONLY_IN_TEXT_CHANNEL);
    }

    const opponent = getOpponent(ctx, TICTACTOE.USAGE_SLASH);
    if (!opponent) return;

    const players = [author, opponent];

    const game = createNewGame(new PhraseGen().generatePhrase());

    const threadChannel = await create1vs1GameChannel(ctx, TICTACTOE.CMD, players, game.id);

    const nextTurn = async (playerIdx: number, prevInteraction: Discord.MessageComponentInteraction | null) => {
      const { finished, winner } = checkFinished(game);
      const opponentIdx = 1 - playerIdx;
      const send = prevInteraction
        ? prevInteraction.reply.bind(prevInteraction)
        : threadChannel.send.bind(threadChannel);

      const buttons = createButtons(game);

      if (finished) {
        await send({
          content: GAME.WINNER_HEADER(players, winner),
          components: buttons
        });
        await threadChannel.setLocked(true).catch(() => void 0);
        await threadChannel.setArchived(true).catch(() => void 0);
      } else {
        const boardMsg = await send({
          content: TICTACTOE.TURN_HEADER(players[playerIdx], playerIdx),
          components: buttons,
          fetchReply: true
        });

        const collector = threadChannel.createMessageComponentCollector({
          filter: interaction => interaction.message.id === boardMsg.id,
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

          const [rowIdx, colIdx] = interaction.customId.split("/");
          const { grid } = game;

          grid[rowIdx][colIdx] = playerIdx;

          collector.stop(TICTACTOE.SYMBOL.NEXT_TURN);

          void nextTurn(opponentIdx, interaction);
        });

        collector.on("end", async (_, reason) => {
          if (reason === TICTACTOE.SYMBOL.NEXT_TURN) return;

          const lastButtons = createButtons(game);

          await threadChannel.send({
            content: GAME.END_BY_TIME,
            components: lastButtons
          }).catch(() => void 0);

          await threadChannel.setLocked(true).catch(() => void 0);
          await threadChannel.setArchived(true).catch(() => void 0);
        });
      }
    };

    void nextTurn(Math.round(Math.random()), null);
  }
});

interface TicTacToeGame {
  id: string;
  grid: number[][];
}

const createNewGame = (id: string): TicTacToeGame => ({
  id,
  grid: range(3).map(() => [...range(3).map(() => -1)])
});

const checkFinished = (game: TicTacToeGame): { finished: boolean; winner: number } => {
  const { grid } = game;

  // horizontal
  for (const row of grid) {
    const rowSum = row.reduce((total, val) => total + val, 0);
    const filled = row.every(col => col >= 0);
    const hasSameCol = filled && (rowSum === 0 || rowSum === 3);

    if (hasSameCol) {
      return {
        finished: true,
        winner: rowSum / 3
      };
    }
  }

  // vertical
  for (const colIdx of range(3)) {
    const colSum = grid.reduce((total, row) => total + row[colIdx], 0);
    const filled = grid.every(row => row[colIdx] >= 0);
    const hasSameCol = filled && (colSum === 0 || colSum === 3);

    if (hasSameCol) {
      return {
        finished: true,
        winner: colSum / 3
      };
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
    return { finished: true, winner: seSum / 3 };
  }

  if (swFilled && (swSum === 0) || (swSum === 3)) {
    return { finished: true, winner: swSum / 3 };
  }

  const allFilled = grid.every(row => row.every(val => val >= 0));

  return {
    finished: allFilled,
    winner: -1
  };
};

const createButtons = (game: TicTacToeGame): MessageActionRow[] => {
  const { grid } = game;

  const rows = range(3).map(rowIdx => {
    const row = new MessageActionRow();

    const buttons = range(3).map(colIdx => {
      const btn = new MessageButton()
        .setCustomId(`${rowIdx}/${colIdx}`)
        .setStyle("SECONDARY");
      const playerIdx = grid[rowIdx][colIdx];

      if (playerIdx >= 0) {
        btn.setEmoji(TICTACTOE.MARK[playerIdx]);
        btn.setDisabled(true);
      } else {
        btn.setLabel(EMOJI.ZERO_WIDTH_SPACE);
      }

      return btn;
    });

    row.addComponents(...buttons);
    return row;
  });

  return rows;
};
