import Discord from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import PhraseGen from "korean-random-words";

import { createGameChannel } from "./utils";

import Siamese from "~/Siamese";
import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import * as COLOR from "~/const/color";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import { ONECARD } from "~/const/command/minigame";
import GameRoom from "~/core/game/GameRoom";
import OneCardGame from "~/core/game/onecard/OneCardGame";

export default new Command({
  name: ONECARD.CMD,
  description: ONECARD.DESC,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.CREATE_PUBLIC_THREADS,
    PERMISSION.SEND_MESSAGES_IN_THREADS,
    PERMISSION.USE_EXTERNAL_EMOJIS,
    PERMISSION.MANAGE_THREADS
  ],
  cooldown: Cooldown.PER_USER(10),
  beforeRegister: (bot: Siamese) => bot.env.PLAYING_CARDS_DIR != null,
  slashData: new SlashCommandBuilder()
    .setName(ONECARD.CMD)
    .setDescription(ONECARD.DESC),
  sendTyping: false,
  execute: async ctx => {
    const { bot, channel, author } = ctx;

    if (channel.isThread()) {
      return await bot.replyError(ctx, ERROR.CMD.ONLY_IN_TEXT_CHANNEL);
    }

    const id = new PhraseGen().generatePhrase();
    const game = new GameRoom(ctx, 2, 4);
    const threadChannel = await createGameChannel(ctx, ONECARD.CMD, [author], id);

    await showRules(threadChannel);

    const canStart = await game.waitForPlayers(ONECARD.JOIN_MSG_TITLE(author), threadChannel);

    if (canStart) {
      const oneCard = new OneCardGame(game.players, threadChannel, bot.env.PLAYING_CARDS_DIR!);
      await oneCard.start();
    }
  }
});

const showRules = async (threadChannel: Discord.ThreadChannel) => {
  const embed = new Discord.MessageEmbed();

  embed.setTitle(ONECARD.HELP_TITLE);
  embed.setDescription(ONECARD.HELP_DESC);
  embed.setColor(COLOR.BOT);

  embed.addField(ONECARD.HELP_SPECIAL_TITLE, ONECARD.HELP_SPECIAL_DESC);
  embed.addField(ONECARD.HELP_DEFEAT_TITLE, ONECARD.HELP_DEFEAT_DESC);

  await threadChannel.send({
    embeds: [embed]
  });
};
