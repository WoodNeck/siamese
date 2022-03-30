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
    PERMISSION.USE_EXTERNAL_EMOJIS,
    PERMISSION.EMBED_LINKS
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
    const gameRoom = new GameRoom(ctx, 1, 4);
    const threadChannel = await createGameChannel(ctx, MAHJONG.CMD, [author], id);
    const canStart = await gameRoom.waitForPlayers(MAHJONG.JOIN_MSG_TITLE(author), threadChannel);

    if (canStart) {
      const game = new MahjongGame([
        ...gameRoom.players,
        ...gameRoom.players,
        ...gameRoom.players,
        ...gameRoom.players
      ], threadChannel);
      void game.start();
    }
  }
});
