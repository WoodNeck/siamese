import { ThreadAutoArchiveDuration, type TextChannel, type User } from "discord.js";
import PhraseGen from "korean-random-words";

import { GameRoom } from "./GameRoom";
import { ERROR, GAME } from "./const";

import type { CommandContext } from "@siamese/core";

/**
 * 1:1 게임룸을 개설합니다
 */
export const createVSGameRoom = async (ctx: CommandContext, opponent: User | null, gameName: string) => {
  if (opponent && opponent.bot) {
    return await ctx.sender.replyError(ERROR.MENTION_NO_BOT);
  }

  const initiator = ctx.getUser();
  if (opponent && opponent.id === initiator.id) {
    return await ctx.sender.replyError(ERROR.MENTION_NO_SELF);
  }

  const players = [initiator, opponent].filter(val => !!val) as User[];
  const threadChannel = await createGameChannel(ctx, gameName, players);
  if (!threadChannel) return null;

  return new GameRoom(ctx.bot, threadChannel, players, 2, 2);
};

/**
 * 다수의 인원이 참가 가능한 게임룸을 개설합니다
 */
export const createGameRoom = async (ctx: CommandContext, gameName: string, minPlayer: number, maxPlayer: number) => {
  const players = [ctx.getUser()];
  const threadChannel = await createGameChannel(ctx, gameName, players);
  if (!threadChannel) return null;

  return new GameRoom(ctx.bot, threadChannel, players, minPlayer, maxPlayer);
};

export const createGameChannel = async (ctx: CommandContext, gameName: string, players: User[]) => {
  const channel = await ctx.getChannel() as TextChannel;
  const id = new PhraseGen().generatePhrase();

  try {
    const threadChannel = await channel.threads.create({
      name: GAME.THREAD_NAME(gameName, id),
      autoArchiveDuration: ThreadAutoArchiveDuration.OneHour
    });

    await Promise.all(players.map(player => threadChannel.members.add(player)));

    return threadChannel;
  } catch (err) {
    await ctx.bot.logger.error(new Error(`쓰레드 채널 생성 실패: ${err}`));
    await ctx.sender.replyError(ERROR.FAILED_TO_CREATE_THREAD);

    return null;
  }
};
