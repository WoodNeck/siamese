import { GuildMember } from "discord.js";

import CommandContext from "~/core/CommandContext";
import SlashCommandContext from "~/core/SlashCommandContext";
import * as ERROR from "~/const/error";
import { GAME } from "~/const/command/minigame";

export const getOpponent = (ctx: CommandContext | SlashCommandContext, optionKey: string): GuildMember | null => {
  const { bot, guild } = ctx;

  const mentionedUser = ctx.isSlashCommand()
    ? ctx.interaction.options.getUser(optionKey, true)
    : ctx.msg.mentions.users.first();

  if (!mentionedUser) {
    void bot.replyError(ctx, ERROR.CMD.MENTION_NEEDED);
    return null;
  }
  if (mentionedUser.bot) {
    void bot.replyError(ctx, ERROR.CMD.MENTION_NO_BOT);
    return null;
  }

  return guild.members.resolve(mentionedUser)!;
};

export const createGameChannel = async (ctx: CommandContext | SlashCommandContext, gameName: string, players: GuildMember[], id: string) => {
  const message = ctx.isSlashCommand()
    ? await ctx.bot.send(ctx, { content: GAME.START_MSG(gameName), fetchReply: true })
    : ctx.msg;

  const threadChannel = await message!.startThread({
    name: GAME.THREAD_NAME(gameName, id),
    autoArchiveDuration: 60 // 1hour
  });

  await Promise.all(players.map(player => threadChannel.members.add(player)));

  return threadChannel;
};


export const create1vs1GameChannel = async (ctx: CommandContext | SlashCommandContext, gameName: string, players: GuildMember[], id: string) => {
  const message = ctx.isSlashCommand()
    ? await ctx.bot.send(ctx, { content: GAME.START_MSG(gameName), fetchReply: true })
    : ctx.msg;

  const threadChannel = await message!.startThread({
    name: GAME.THREAD_1VS1_NAME(gameName, players[0].displayName, players[1].displayName, id),
    autoArchiveDuration: 60 // 1hour
  });

  await Promise.all([
    threadChannel.members.add(players[0]),
    threadChannel.members.add(players[1])
  ]);

  return threadChannel;
};

