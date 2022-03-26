import Discord, { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { createCanvas, loadImage } from "canvas";

import Command from "~/core/Command";
import { GAME, LADDER } from "~/const/command/minigame";
import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import GameRoom from "~/core/game/GameRoom";
import { getRandom, groupBy, parseArgs, range, shuffle } from "~/util/helper";

export default new Command({
  name: LADDER.CMD,
  description: LADDER.DESC,
  alias: LADDER.ALIAS,
  permissions: [
    PERMISSION.EMBED_LINKS
  ],
  sendTyping: false,
  slashData: new SlashCommandBuilder()
    .setName(LADDER.CMD)
    .setDescription(LADDER.DESC)
    .addStringOption(option => option
      .setName(LADDER.SLASH_USAGE)
      .setDescription(LADDER.USAGE_DESC)
      .setRequired(false)
    ) as SlashCommandBuilder,
  execute: async ctx => {
    const { bot, channel, author } = ctx;

    const content = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(LADDER.SLASH_USAGE, false)
      : ctx.content;

    let args: string[] = [];

    if (content) {
      args = parseArgs(content);

      if (args.length < 2 || args.length > 9) {
        return await bot.replyError(ctx, LADDER.ARG_NOT_IN_RANGE);
      }
    }

    const gameTitle = LADDER.JOIN_MSG_TITLE(author);
    const minArg = args.length > 0 ? args.length : 2;
    const maxArg = args.length > 0 ? args.length : 9;

    const game = new GameRoom(ctx, minArg, maxArg);
    const canStart = await game.waitForPlayers(gameTitle, channel);

    if (!canStart) return;

    const users = shuffle(game.players.map(player => player.user));
    const userCount = users.length;
    const rowCount = Math.min(2 * (userCount - 1), 8);
    const connections = range(rowCount).map(() => range(userCount - 1).map(() => false));
    const canvas = createCanvas(userCount * 64, 16 * (rowCount + 1) + 128);

    // Set connections
    const possibility = 0.5;
    connections.forEach(row => {
      for (let column = 0; column < row.length; column++) {
        const wasConnected = !!row[column - 1];
        if (!wasConnected && Math.random() < possibility) {
          row[column] = true;
        }
      }
    });

    range(userCount - 1).forEach(column => {
      if (connections.every(row => !row[column])) {
        const connectibility = connections.map((row, rowIdx) => {
          const canConnect = !row[column - 1] && !row[column - 1];
          return {
            index: rowIdx,
            canConnect
          };
        }).filter(val => val.canConnect);

        if (connectibility.length <= 0) return;

        const { index } = getRandom(connectibility);
        connections[index][column] = true;
      }
    });

    const userAvatars = await Promise.all(
      users.map(async user => {
        return await loadImage(user.displayAvatarURL({ format: "png" }));
      })
    );
    const numberEmojis = await Promise.all(
      users.map(async (_, idx) => {
        return await loadImage(LADDER.NUMBER_URL[idx]);
      })
    );

    const canvasCtx = canvas.getContext("2d");

    userAvatars.forEach((avatar, idx) => {
      const avatarX = 64 * idx + 32;
      const avatarY = 32;
      const emoji = numberEmojis[idx];

      canvasCtx.save();
      canvasCtx.beginPath();
      canvasCtx.arc(avatarX, avatarY, 16, 0, 2 * Math.PI);
      canvasCtx.clip();
      canvasCtx.drawImage(avatar, 0, 0, avatar.width, avatar.height, avatarX - 16, avatarY - 16, 32, 32);
      canvasCtx.restore();

      canvasCtx.save();
      canvasCtx.lineWidth = 10;
      canvasCtx.lineCap = "round";
      canvasCtx.strokeStyle = "#999999";
      canvasCtx.beginPath();
      canvasCtx.moveTo(avatarX, avatarY + 32);
      canvasCtx.lineTo(avatarX, canvas.height - 64);
      canvasCtx.stroke();
      canvasCtx.restore();

      canvasCtx.save();
      canvasCtx.drawImage(emoji, 0, 0, emoji.width, emoji.height, avatarX - 16, canvas.height - 48, 32, 32);
      canvasCtx.restore();
    });

    connections.forEach((row, rowIdx) => {
      const y = 64 + 16 * (rowIdx + 1);

      row.forEach((column, columnIdx) => {
        if (!column) return;
        const x = 64 * columnIdx + 32;

        canvasCtx.save();
        canvasCtx.lineWidth = 5;
        canvasCtx.strokeStyle = "#999999";
        canvasCtx.beginPath();
        canvasCtx.moveTo(x, y);
        canvasCtx.lineTo(x + 64, y);
        canvasCtx.stroke();
        canvasCtx.restore();
      });
    });

    const ladderEmbeds: MessageEmbed[] = [];

    if (args.length > 0) {
      const ladderEmbed = new MessageEmbed();
      ladderEmbed.setTitle(gameTitle);
      ladderEmbed.setColor(COLOR.BOT);
      ladderEmbed.setDescription(args.map((arg, idx) => `${idx + 1}${EMOJI.KEYCAP} - ${arg}`).join("\n"));

      ladderEmbeds.push(ladderEmbed);
    }

    const numButtons = users.map((_, idx) => {
      return new MessageButton()
        .setCustomId(idx.toString())
        .setEmoji(`${idx + 1}${EMOJI.KEYCAP}`)
        .setStyle("SECONDARY");
    });
    const showResultButton = new MessageButton()
      .setLabel(LADDER.SHOW_RESULT)
      .setStyle("SUCCESS")
      .setCustomId(GAME.SYMBOL.SKIP);

    const buttonRows = groupBy([...numButtons, showResultButton], 5).map(buttons => {
      const row = new MessageActionRow();

      row.addComponents(...buttons);

      return row;
    });

    const ladderMsg = await bot.send(ctx, {
      embeds: ladderEmbeds,
      components: buttonRows,
      files: [{ attachment: canvas.toBuffer() }],
      fetchReply: true
    }) as Discord.Message<boolean>;

    const collector = ladderMsg.createMessageComponentCollector({
      filter: interaction => !interaction.user.bot && interaction.message.id === ladderMsg.id,
      time: 9 * 60 * 1000 // 9 min
    });
    const sent = users.map(() => false);

    collector.on("collect", async interaction => {
      if (interaction.user.id !== author.id) {
        return void interaction.reply({
          content: ERROR.GAME.ONLY_FOR_INITIATOR,
          ephemeral: true
        }).catch(() => void 0);
      }

      if (interaction.customId === GAME.SYMBOL.SKIP) {
        await interaction.update({
          components: []
        }).catch(() => void 0);

        const resultEmbed = new MessageEmbed();

        resultEmbed.setTitle(gameTitle);
        resultEmbed.setColor(COLOR.BOT);

        const resultIndexes = users.map((_, idx) => {
          let resultIdx = idx;

          [...connections].reverse().forEach(row => {
            if (row[idx]) resultIdx += 1;
            if (row[idx - 1]) resultIdx -= 1;
          });

          return resultIdx;
        });

        const result = users.map((_, idx) => {
          const resultIdx = resultIndexes[idx];
          const arg = args[resultIdx];
          const user = users[resultIdx];
          return `${idx + 1}${EMOJI.KEYCAP}${arg ? ` ${arg}` : ""} - ${user.displayName}`;
        }).join("\n");
        resultEmbed.setDescription(result);

        await interaction.followUp({
          embeds: [resultEmbed]
        }).catch(() => void 0);

        collector.stop();
      } else {
        const checkingIdx = parseFloat(interaction.customId);
        if (sent[checkingIdx]) {
          return void interaction.reply({
            content: LADDER.RESULT_SENT_ALREADY,
            ephemeral: true
          }).catch(() => void 0);
        }

        sent[checkingIdx] = true;
        await interaction.deferReply().catch(() => void 0);

        const connectionCanvas = createCanvas(canvas.width, canvas.height);
        const connectionCtx = connectionCanvas.getContext("2d");

        connectionCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);

        let currentColumn = checkingIdx;

        const startX = 64 * currentColumn + 32;
        const startY = canvas.height - 64;

        [[], ...connections].reverse().forEach((row, rowIdx) => {
          const x = 64 * currentColumn + 32;
          const y = canvas.height - 64 - 16 * rowIdx;

          let nextColumn = currentColumn;
          if (row[currentColumn]) {
            nextColumn = currentColumn + 1;
          } else if (row[currentColumn - 1]) {
            nextColumn = currentColumn - 1;
          }

          connectionCtx.save();
          connectionCtx.lineWidth = 10;
          connectionCtx.strokeStyle = "#ffffff";
          connectionCtx.beginPath();
          connectionCtx.moveTo(x, y + 2.5);
          connectionCtx.lineTo(x, y - 18.5);
          connectionCtx.stroke();
          connectionCtx.restore();

          if (nextColumn !== currentColumn) {
            const newX = 64 * nextColumn + 32;

            connectionCtx.save();
            connectionCtx.lineWidth = 5;
            connectionCtx.strokeStyle = "#ffffff";
            connectionCtx.beginPath();
            connectionCtx.moveTo(x, y - 16);
            connectionCtx.lineTo(newX, y - 16);
            connectionCtx.stroke();
            connectionCtx.restore();

            currentColumn = nextColumn;
          }
        });

        const endX = 64 * currentColumn + 32;
        const endY = 64;

        connectionCtx.save();
        connectionCtx.lineWidth = 10;
        connectionCtx.strokeStyle = "#ffffff";
        connectionCtx.lineCap = "round";
        connectionCtx.beginPath();
        connectionCtx.moveTo(startX, startY);
        connectionCtx.lineTo(startX, startY - 1);
        connectionCtx.stroke();
        connectionCtx.beginPath();
        connectionCtx.moveTo(endX, endY);
        connectionCtx.lineTo(endX, endY + 1);
        connectionCtx.stroke();
        connectionCtx.restore();

        await interaction.followUp({
          files: [{ attachment: connectionCanvas.toBuffer() }]
        }).catch(err => {
          console.error(err);
        });
      }
    });
  }
});
