import Discord, { GuildMember, MessageComponentInteraction } from "discord.js";

import CommandContext from "~/core/CommandContext";
import SlashCommandContext from "~/core/SlashCommandContext";
import { GAME } from "~/const/command/minigame";

export const getOpponent = (ctx: CommandContext | SlashCommandContext, optionKey: string): GuildMember | null => {
  const { guild } = ctx;

  const mentionedUser = ctx.isSlashCommand()
    ? ctx.interaction.options.getUser(optionKey, false)
    : ctx.msg.mentions.users.first();

  if (!mentionedUser) return null;

  return guild.members.resolve(mentionedUser)!;
};

export const createGameChannel = async (ctx: CommandContext | SlashCommandContext, gameName: string, players: GuildMember[], id: string) => {
  const message = ctx.isSlashCommand()
    ? await ctx.bot.send(ctx, { content: GAME.START_MSG(gameName), fetchReply: true })
    : ctx.msg;

  const threadChannel = await (message as Discord.Message).startThread({
    name: GAME.THREAD_NAME(gameName, id),
    autoArchiveDuration: 60 // 1hour
  });

  await Promise.all(players.map(player => threadChannel.members.add(player)));

  return threadChannel;
};

/**
 * @returns blocked
 */
export const blockOtherInteractions = async (interaction: MessageComponentInteraction, playerId: string, opponentId: string): Promise<boolean> => {
  if (interaction.user.id === playerId) return false;

  if (interaction.user.id === opponentId) {
    await interaction.reply({ content: GAME.NOT_YOUR_TURN, ephemeral: true });
  } else {
    await interaction.reply({ content: GAME.NOT_IN_GAME, ephemeral: true });
  }

  return true;
};
