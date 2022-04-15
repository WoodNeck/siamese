import { SlashCommandBuilder } from "@discordjs/builders";

import { getOpponent } from "./utils";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import VsGameRoom from "~/core/game/VsGameRoom";
import TicTacToeGame from "~/core/game/tictactoe/TicTacToeGame";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import { TICTACTOE } from "~/const/command/minigame";

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
      .setRequired(false)
    ) as SlashCommandBuilder,
  sendTyping: false,
  execute: async ctx => {
    const { bot, author, channel } = ctx;

    if (channel.isThread()) {
      return await bot.replyError(ctx, ERROR.CMD.ONLY_IN_TEXT_CHANNEL);
    }

    const opponent = getOpponent(ctx, TICTACTOE.USAGE_SLASH);

    if (opponent && opponent.user.bot) {
      return await bot.replyError(ctx, ERROR.CMD.MENTION_NO_BOT);
    }

    const room = new VsGameRoom(ctx, opponent);
    const canStart = await room.waitForPlayers(TICTACTOE.CMD, TICTACTOE.JOIN_MSG_TITLE(author));
    if (!canStart) return;

    const game = new TicTacToeGame(room.players, room.threadChannel);
    await game.start();
  }
});
