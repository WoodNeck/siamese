import { DiscordAPIError } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { getOpponent } from "./utils";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import VsGameRoom from "~/core/game/VsGameRoom";
import YachtGame from "~/core/game/yacht/YachtGame";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import { YACHT } from "~/const/command/minigame";
import { DISCORD_ERROR_CODE } from "~/const/discord";

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
      .setRequired(false)
    ) as SlashCommandBuilder,
  sendTyping: false,
  execute: async ctx => {
    const { bot, author, channel } = ctx;

    if (channel.isThread()) {
      return await bot.replyError(ctx, ERROR.CMD.ONLY_IN_TEXT_CHANNEL);
    }
    const opponent = getOpponent(ctx, YACHT.USAGE_SLASH);

    if (opponent && opponent.user.bot) {
      return await bot.replyError(ctx, ERROR.CMD.MENTION_NO_BOT);
    }

    const room = new VsGameRoom(ctx, opponent);
    const canStart = await room.waitForPlayers(YACHT.CMD, YACHT.JOIN_MSG_TITLE(author));
    if (!canStart) return;

    try {
      const game = new YachtGame(room.players, room.threadChannel);
      await game.start();
    } catch (err) {
      if (!(err instanceof DiscordAPIError) || err.code !== DISCORD_ERROR_CODE.UNKNOWN_CHANNEL) {
        throw err;
      }
    }
  }
});
