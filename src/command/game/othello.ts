import Discord, { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import PhraseGen from "korean-random-words";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import * as COLOR from "~/const/color";
import * as ERROR from "~/const/error";
import * as EMOJI from "~/const/emoji";
import * as PERMISSION from "~/const/permission";
import { GAME, OTHELLO } from "~/const/command/game";
import { range } from "~/util/helper";

export default new Command({
  name: OTHELLO.CMD,
  description: OTHELLO.DESC,
  usage: OTHELLO.USAGE,
  alias: OTHELLO.ALIAS,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.CREATE_PUBLIC_THREADS,
    PERMISSION.SEND_MESSAGES_IN_THREADS,
    PERMISSION.MANAGE_THREADS
  ],
  cooldown: Cooldown.PER_USER(10),
  slashData: new SlashCommandBuilder()
    .setName(OTHELLO.CMD)
    .setDescription(OTHELLO.DESC)
    .addUserOption(option => option
      .setName(OTHELLO.USAGE_SLASH)
      .setDescription(OTHELLO.DESC_SLASH)
      .setRequired(true)
    ) as SlashCommandBuilder,
  sendTyping: false,
  execute: async ctx => {
    const { bot, author, channel, guild } = ctx;

    const mentionedUser = ctx.isSlashCommand()
      ? ctx.interaction.options.getUser(OTHELLO.USAGE_SLASH, true)
      : ctx.msg.mentions.users.first();

    if (channel.isThread()) {
      return await bot.replyError(ctx, ERROR.CMD.ONLY_IN_TEXT_CHANNEL);
    }
    if (!mentionedUser) {
      return await bot.replyError(ctx, ERROR.CMD.MENTION_NEEDED);
    }
    if (mentionedUser.bot) {
      return await bot.replyError(ctx, ERROR.CMD.MENTION_NO_BOT);
    }

    const players = [author, guild.members.resolve(mentionedUser)!];

    const game = createNewGame(new PhraseGen().generatePhrase());

    const message = ctx.isSlashCommand()
      ? await bot.send(ctx, { content: OTHELLO.SLASH_MSG, fetchReply: true })
      : ctx.msg;

    const threadChannel = await message!.startThread({
      name: OTHELLO.THREAD_NAME(players[0].displayName, players[1].displayName, game.id),
      autoArchiveDuration: 60 // 1hour
    });

    await Promise.all([
      threadChannel.members.add(players[0]),
      threadChannel.members.add(players[1])
    ]);

    const nextTurn = async (playerIdx: number, prevInteraction: Discord.MessageComponentInteraction | null) => {
      const { candidates, markerCount, finished } = calcCandidates(game.grid, playerIdx);
      const opponentIdx = 1 - playerIdx;

      const send = prevInteraction
        ? prevInteraction.reply.bind(prevInteraction)
        : threadChannel.send.bind(threadChannel);

      if (finished) {
        await send({ ...drawFinishedGrid(game, players) });
        await threadChannel.setLocked(true).catch(() => void 0);
        await threadChannel.setArchived(true).catch(() => void 0);
      } else {
        const buttonCount = Math.min(markerCount, 25);
        const rowCount = Math.floor((buttonCount - 1) / 5) + 1;
        const buttonRows = createButtons(rowCount, buttonCount, 0);

        const messages = [await send({
          ...drawPlayingGrid(game, candidates, players, playerIdx),
          components: buttonRows,
          fetchReply: true
        })];

        if (markerCount > 25) {
          const exceedRowCount = Math.floor((markerCount - 1) / 5) - 4;
          const exceedRows = createButtons(exceedRowCount, markerCount, 25);
          const sendExceed = prevInteraction
            ? prevInteraction.followUp.bind(prevInteraction)
            : threadChannel.send.bind(threadChannel);

          const exceedMsg = await sendExceed({
            components: exceedRows,
            fetchReply: true
          });

          messages.push(exceedMsg);
        }

        const collector = threadChannel.createMessageComponentCollector({
          filter: interaction => messages.some(msg => msg.id === interaction.message.id),
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

          if (interaction.customId === OTHELLO.SYMBOL.GG) {
            collector.stop(OTHELLO.SYMBOL.GG);
            return;
          }

          const candidatePositions = candidates.reduce((positions, row, rowIdx) => {
            const posMapped = row.map((val, colIdx) => val && [rowIdx, colIdx]).filter(val => !!val);
            return [...positions, ...posMapped];
          }, []);

          const [rowIdx, colIdx] = candidatePositions[interaction.customId];
          placeAtGrid(game, rowIdx, colIdx, playerIdx);

          collector.stop(OTHELLO.SYMBOL.NEXT_TURN);

          void nextTurn(opponentIdx, interaction);
        });

        collector.on("end", async (collected, reason) => {
          if (reason === OTHELLO.SYMBOL.NEXT_TURN) return;

          const lastGrid = drawFinishedGrid(game, players);

          if (reason === OTHELLO.SYMBOL.GG) {
            const lastInteraction = collected.last()!;
            await lastInteraction.reply({
              ...lastGrid,
              content: GAME.END_BY_SURRENDER(lastInteraction.member as Discord.GuildMember)
            }).catch(() => void 0);
          } else {
            await threadChannel.send({
              ...lastGrid,
              content: GAME.END_BY_TIME
            }).catch(() => void 0);
          }

          await threadChannel.setLocked(true).catch(() => void 0);
          await threadChannel.setArchived(true).catch(() => void 0);
        });
      }
    };

    void nextTurn(1, null);
  }
});

interface OrthelloGame {
  id: string;
  grid: number[][];
  changes: number[][];
}

const createNewGame = (id: string): OrthelloGame => ({
  id,
  grid: (() => {
    const gridArr = range(8).map(() => [...range(8).map(() => -1)]);

    gridArr[3][3] = 1;
    gridArr[3][4] = 0;
    gridArr[4][3] = 0;
    gridArr[4][4] = 1;

    return gridArr;
  })(),
  changes: range(8).map(() => [...range(8).map(() => -1)])
});

const calcCandidates = (grid: number[][], playerIdx: number): {
  candidates: Array<Array<string | null>>;
  markerCount: number;
  finished: boolean;
} => {
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
};

const drawPlayingGrid = (game: OrthelloGame, candidates: Array<Array<(string | null)>>, players: Discord.GuildMember[], playerIdx: number) => {
  const embed = new MessageEmbed();
  const board = drawBoard(game, candidates);
  const [whiteCount, blackCount] = getDiscCount(game.grid);

  embed.setDescription(board);
  embed.setColor(getPlayerColor(playerIdx));
  embed.addField(OTHELLO.FIELD_TITLE(players), OTHELLO.FIELD_DESC(players, whiteCount, blackCount));

  return {
    content: OTHELLO.TURN_HEADER(players[playerIdx], playerIdx),
    embeds: [embed]
  };
};

const drawFinishedGrid = (game: OrthelloGame, players: Discord.GuildMember[]) => {
  const embed = new MessageEmbed();

  game.changes.forEach(row => {
    row.forEach((_, idx) => row[idx] = -1);
  });

  const board = drawBoard(game);
  const [whiteCount, blackCount] = getDiscCount(game.grid);

  const winner = whiteCount > blackCount
    ? 0
    : blackCount > whiteCount
      ? 1
      : -1;

  const winnerColor = getPlayerColor(winner);

  embed.setDescription(board);
  embed.setColor(winnerColor);
  embed.addField(OTHELLO.FIELD_TITLE(players), OTHELLO.FIELD_DESC(players, whiteCount, blackCount));

  return {
    content: OTHELLO.FINISHED_HEADER(players, winner),
    embeds: [embed]
  };
};

const drawBoard = (game: OrthelloGame, candidates?: Array<Array<(string | null)>>) => {
  const { grid, changes } = game;

  return grid.map((row, rowIdx) => {
    return row.map((val, colIdx) => {
      if (changes[rowIdx][colIdx] >= 0) return OTHELLO.DISC_ACTIVE[changes[rowIdx][colIdx]];
      if (val >= 0) return OTHELLO.DISC[val];
      if (candidates && candidates[rowIdx][colIdx]) return candidates[rowIdx][colIdx];

      return EMOJI.SMALL_BLACK_SQUARE;
    }).join(" ");
  }).join("\n");
};

const createButtons = (rowCount: number, buttonCount: number, markerOffset: number) => {
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
  ggButton.setCustomId(OTHELLO.SYMBOL.GG);
  ggButton.setStyle("DANGER");
  otherActions.addComponents(ggButton);

  buttonRows.push(otherActions);

  return buttonRows;
};

const placeAtGrid = (game: OrthelloGame, x: number, y: number, playerIdx: number) => {
  const { grid, changes } = game;
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
};

const getDiscCount = (grid: number[][]) => {
  const whiteCount = grid.reduce((whites, row) => {
    return [...whites, ...row.filter(val => val === 0)];
  }, []).length;
  const blackCount = grid.reduce((blacks, row) => {
    return [...blacks, ...row.filter(val => val === 1)];
  }, []).length;

  return [whiteCount, blackCount];
};

const getPlayerColor = (index: number) => {
  if (index < 0) return COLOR.BLACK;
  return index === 0
    ? COLOR.ORANGE
    : COLOR.BLUE;
};
