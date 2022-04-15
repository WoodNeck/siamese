import { SlashCommandBuilder } from "@discordjs/builders";

import { getOpponent } from "./utils";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import VsGameRoom from "~/core/game/VsGameRoom";
import Connect4Game from "~/core/game/connect4/Connect4Game";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import { CONNECT4 } from "~/const/command/minigame";

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
      .setRequired(false)
    ) as SlashCommandBuilder,
  sendTyping: false,
  execute: async ctx => {
    const { bot, author, channel } = ctx;

    if (channel.isThread()) {
      return await bot.replyError(ctx, ERROR.CMD.ONLY_IN_TEXT_CHANNEL);
    }

    const opponent = getOpponent(ctx, CONNECT4.USAGE_SLASH);

    if (opponent && opponent.user.bot) {
      return await bot.replyError(ctx, ERROR.CMD.MENTION_NO_BOT);
    }

    const room = new VsGameRoom(ctx, opponent);
    const canStart = await room.waitForPlayers(CONNECT4.CMD, CONNECT4.JOIN_MSG_TITLE(author));
    if (!canStart) return;

    const game = new Connect4Game(room.players, room.threadChannel);
    await game.start();
  }
});
