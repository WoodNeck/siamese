import { Collection, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "~/core/Command";
import * as COLOR from "~/const/color";
import * as ERROR from "~/const/error";
import * as EMOJI from "~/const/emoji";
import * as PERMISSION from "~/const/permission";
import { GUESS } from "~/const/command/minigame";
import CommandContext from "~/core/CommandContext";
import SlashCommandContext from "~/core/SlashCommandContext";

const instances = new Collection<string, { initiator: string; content: string }>();

export default new Command({
  name: GUESS.CMD,
  description: GUESS.DESC,
  permissions: [
    PERMISSION.ADD_REACTIONS,
    PERMISSION.EMBED_LINKS,
    PERMISSION.READ_MESSAGE_HISTORY,
    PERMISSION.CREATE_PUBLIC_THREADS,
    PERMISSION.SEND_MESSAGES_IN_THREADS,
    PERMISSION.MANAGE_THREADS
  ],
  sendTyping: false,
  slashData: new SlashCommandBuilder()
    .setName(GUESS.CMD)
    .setDescription(GUESS.DESC)
    .addStringOption(option => option
      .setName(GUESS.USAGE_SLASH)
      .setDescription(GUESS.DESC_SLASH)
      .setRequired(true)
    ) as SlashCommandBuilder,
  execute: async ctx => {
    const { bot, channel, author } = ctx;

    // Instance check
    if (instances.has(channel.id)) {
      return bot.replyError(ctx, GUESS.ALREADY_ENABLED);
    }

    instances.set(channel.id, {
      initiator: author.id,
      content: ""
    });

    if (ctx.isSlashCommand()) {
      const content = ctx.interaction.options.getString(GUESS.USAGE_SLASH, true);

      if (content.length < 3 || content.length > 10) {
        instances.delete(channel.id);
        return await bot.send(ctx, { content: GUESS.RANGE_EXCEED, ephemeral: true });
      }

      void startGame(ctx);
    } else {
      const helpMsg = new MessageEmbed();

      helpMsg.setTitle(GUESS.DM_HELP_MSG_TITLE);
      helpMsg.setDescription(GUESS.DM_HELP_MSG_DESC);
      helpMsg.setFooter({ text: GUESS.DM_HELP_MSG_FOOTER });
      helpMsg.setColor(COLOR.BOT);

      const privateMessage = await ctx.author.send({ embeds: [helpMsg] });
      void ctx.msg.react(EMOJI.THUMB_UP).catch(() => void 0);

      const dmCollector = privateMessage.channel.createMessageCollector({
        filter: msg => !msg.author.bot,
        time: 180 * 1000
      });

      dmCollector.on("collect", msg => {
        if (msg.content.length < 3 || msg.content.length > 10) {
          void msg.reply(GUESS.RANGE_EXCEED).catch(() => void 0);
          instances.delete(channel.id);
          return;
        }

        void msg.react(EMOJI.THUMB_UP).catch(() => void 0);

        instances.set(channel.id, {
          initiator: author.id,
          content: msg.content
        });

        dmCollector.stop(GUESS.SYMBOL.GAME_START);
      });

      dmCollector.on("end", (_, reason) => {
        if (reason !== GUESS.SYMBOL.GAME_START) {
          void privateMessage.channel.send(ERROR.CONVERSATION.NO_RESPONSE(180)).catch(() => void 0);
          instances.delete(channel.id);
          return;
        }

        void startGame(ctx);
      });
    }
  }
});

const startGame = async (ctx: CommandContext | SlashCommandContext) => {
  const { bot, channel } = ctx;

  const gameConfig = instances.get(ctx.channel.id)!;
  await bot.send(ctx, { content: GUESS.CH_START_GAME(gameConfig.content) });

  const collector = channel.createMessageCollector({
    filter: msg => !msg.author.bot
      && msg.author.id !== gameConfig.initiator
      && msg.content === gameConfig.content,
    time: 60 * 60 * 1000 // 1 hour
  });

  collector.on("collect", () => {
    void bot.send(ctx, { content: GUESS.CH_ANSWER }).catch(() => void 0);
    collector.stop(GUESS.SYMBOL.GAME_OVER);
  });

  collector.on("end", (_, reason) => {
    instances.delete(channel.id);
    if (reason === GUESS.SYMBOL.GAME_OVER) return;

    void bot.send(ctx, { content: GUESS.CH_NO_ANSWER(gameConfig.content) }).catch(() => void 0);
  });
};
