import { MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import PhraseGen from "korean-random-words";

import { createGameChannel } from "./utils";

import Command from "~/core/Command";
import GameRoom from "~/core/game/GameRoom";
import Cooldown from "~/core/Cooldown";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import { MAHJONG } from "~/const/command/minigame";
import MahjongGame from "~/core/game/mahjong/MahjongGame";

export default new Command({
  name: MAHJONG.CMD,
  description: MAHJONG.DESC,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.CREATE_PUBLIC_THREADS,
    PERMISSION.SEND_MESSAGES_IN_THREADS,
    PERMISSION.USE_EXTERNAL_EMOJIS,
    PERMISSION.MANAGE_THREADS
  ],
  sendTyping: false,
  cooldown: Cooldown.PER_USER(10),
  slashData: new SlashCommandBuilder()
    .setName(MAHJONG.CMD)
    .setDescription(MAHJONG.DESC),
  execute: async ctx => {
    const { bot, channel, author } = ctx;

    if (channel.isThread()) {
      return await bot.replyError(ctx, ERROR.CMD.ONLY_IN_TEXT_CHANNEL);
    }

    const id = new PhraseGen().generatePhrase();
    const gameRoom = new GameRoom(ctx, 4, 4);
    const threadChannel = await createGameChannel(ctx, MAHJONG.CMD, [author], id);

    const betaEmbed = new MessageEmbed();
    betaEmbed.setThumbnail("https://cdn.discordapp.com/attachments/800248063377670145/959327716551823380/TjR0LkT.jpg");
    betaEmbed.setTitle("마작은 현재 베타테스트 중이다냥!");
    betaEmbed.setDescription(`플레이 도중 잘못된 동작이나 버그 등이 발견되면 [개발서버](${bot.env.BOT_DEV_SERVER_INVITE})에 알려달라냥!`);

    await threadChannel.send({
      embeds: [betaEmbed]
    });

    const canStart = await gameRoom.waitForPlayers(MAHJONG.JOIN_MSG_TITLE(author), threadChannel);

    if (canStart) {
      const game = new MahjongGame(gameRoom.players, threadChannel);
      void game.start();
    }
  }
});
