import Discord, { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import PhraseGen from "korean-random-words";

import { createGameChannel, getOpponent } from "./utils";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import * as ERROR from "~/const/error";
import * as EMOJI from "~/const/emoji";
import * as PERMISSION from "~/const/permission";
import { GAME, CONNECT4 } from "~/const/command/minigame";
import { groupBy, isBetween, range } from "~/util/helper";

export default new Command({
  name: CONNECT4.CMD,
  description: CONNECT4.DESC,
  usage: CONNECT4.USAGE,
  alias: CONNECT4.ALIAS,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.CREATE_PUBLIC_THREADS,
    PERMISSION.SEND_MESSAGES_IN_THREADS,
    PERMISSION.MANAGE_THREADS
  ],
  cooldown: Cooldown.PER_USER(10),
  slashData: new SlashCommandBuilder()
    .setName(CONNECT4.CMD)
    .setDescription(CONNECT4.DESC)
    .addUserOption(option => option
      .setName(CONNECT4.USAGE_SLASH)
      .setDescription(CONNECT4.DESC_SLASH)
      .setRequired(true)
    ) as SlashCommandBuilder,
  sendTyping: false,
  execute: async ctx => {
    const { bot, author, channel } = ctx;

    if (channel.isThread()) {
      return await bot.replyError(ctx, ERROR.CMD.ONLY_IN_TEXT_CHANNEL);
    }

    const opponent = getOpponent(ctx, CONNECT4.USAGE_SLASH);
    if (!opponent) return;

    const players = [author, opponent];

    const game = createNewGame(new PhraseGen().generatePhrase());

    const threadChannel = await createGameChannel(ctx, CONNECT4.CMD, players, game.id);

    const nextTurn = async (playerIdx: number, prevInteraction: Discord.MessageComponentInteraction | null) => {
      const { finished, winner } = checkFinished(game);
      const opponentIdx = 1 - playerIdx;

      const send = prevInteraction
        ? prevInteraction.reply.bind(prevInteraction)
        : threadChannel.send.bind(threadChannel);

      if (finished) {
        // Finished in the last turn
        await send({
          content: GAME.WINNER_HEADER(players, winner),
          embeds: [drawFinishedBoard(game, players, winner)]
        });
        await threadChannel.setLocked(true).catch(() => void 0);
        await threadChannel.setArchived(true).catch(() => void 0);
      } else {
        const board = drawBoard(game, players, playerIdx);
        const buttonRows = createButtons(game);

        const boardMsg = await send({
          content: CONNECT4.TURN_HEADER(players[playerIdx], playerIdx),
          embeds: [board],
          components: buttonRows,
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

          if (interaction.customId === CONNECT4.SYMBOL.GG) {
            collector.stop(CONNECT4.SYMBOL.GG);
            return;
          }

          const colIdx = parseFloat(interaction.customId);
          const { grid } = game;

          for (let rowIdx = grid.length - 1; rowIdx >= 0; rowIdx--) {
            if (grid[rowIdx][colIdx] < 0) {
              grid[rowIdx][colIdx] = playerIdx;
              game.lastPlayed[0] = rowIdx;
              game.lastPlayed[1] = colIdx;
              break;
            }
          }

          collector.stop(CONNECT4.SYMBOL.NEXT_TURN);

          void nextTurn(opponentIdx, interaction);
        });

        collector.on("end", async (collected, reason) => {
          if (reason === CONNECT4.SYMBOL.NEXT_TURN) return;

          const lastGrid = drawFinishedBoard(game, players, opponentIdx);

          if (reason === CONNECT4.SYMBOL.GG) {
            const lastInteraction = collected.last()!;
            await lastInteraction.reply({
              content: GAME.END_BY_SURRENDER(lastInteraction.member as Discord.GuildMember),
              embeds: [lastGrid]
            }).catch(() => void 0);
          } else {
            await threadChannel.send({
              content: GAME.END_BY_TIME,
              embeds: [lastGrid]
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

interface Connect4Game {
  id: string;
  grid: number[][];
  lastPlayed: [number, number];
}

const createNewGame = (id: string): Connect4Game => ({
  id,
  grid: range(6).map(() => [...range(7).map(() => -1)]),
  lastPlayed: [-1, -1]
});

const drawBoard = (game: Connect4Game, players: Discord.GuildMember[], playerIdx: number): MessageEmbed => {
  const { grid, lastPlayed } = game;
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
    lines.push(`${CONNECT4.CIRCLE[idx]}: ${player.displayName}`);
  });

  embed.setDescription(lines.join("\n"));
  embed.setColor(CONNECT4.COLOR[playerIdx]);

  return embed;
};

const drawFinishedBoard = (game: Connect4Game, players: Discord.GuildMember[], winner: number): MessageEmbed => {
  const { grid } = game;
  const connected4 = findConnected4(game);
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
    lines.push(`${playerIdx === winner ? EMOJI.CROWN : CONNECT4.CIRCLE[playerIdx]}: ${player.displayName}`);
  });

  embed.setDescription(lines.join("\n"));
  embed.setColor(CONNECT4.COLOR[winner]);

  return embed;
};

const checkFinished = (game: Connect4Game): { finished: boolean; winner: number } => {
  const { grid, lastPlayed } = game;
  const connected4 = findConnected4(game);

  if (connected4.length > 0) {
    const lastPlayer = grid[lastPlayed[0]][lastPlayed[1]];

    return { finished: true, winner: lastPlayer };
  }

  // Check whether grids are occupied
  const allFilled = grid.every(row => row.every(val => val >= 0));

  if (allFilled) {
    // Draw
    return { finished: true, winner: -1 };
  } else {
    return { finished: false, winner: -1 };
  }
};

const findConnected4 = (game: Connect4Game): Array<[number, number]> => {
  const { grid, lastPlayed } = game;
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
};

const createButtons = (game: Connect4Game): MessageActionRow[] => {
  const { grid } = game;

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
  ggButton.setCustomId(CONNECT4.SYMBOL.GG);
  ggButton.setStyle("DANGER");

  rows[1].addComponents(ggButton);

  return rows;
};
