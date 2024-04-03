import { COLOR } from "@siamese/color";
import { Command, CommandContext, Cooldown, GuildTextOnly } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { createGameRoom, OneCardGame } from "@siamese/minigame";

import { MINIGAME_PERMISSIONS, ONECARD } from "./const";

import type { GameContext } from "@siamese/minigame/src/GameContext";

class Onecard extends Command {
  public override define() {
    return {
      data: ONECARD,
      sendTyping: false,
      permissions: MINIGAME_PERMISSIONS,
      preconditions: [
        GuildTextOnly,
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ ctx, getUser }: CommandContext) {
    const room = await createGameRoom(ctx, ONECARD.CMD, 2, 4);
    if (!room) return;

    const gameCtx = room.getContext();
    await this._showRules(gameCtx);

    const canStart = await room.waitForPlayers(ONECARD.JOIN_MSG_TITLE(getUser()));
    if (!canStart) return;

    const game = new OneCardGame(gameCtx);

    await game.start();
  }

  private async _showRules({ sender }: GameContext) {
    const embed = new EmbedBuilder({
      title: ONECARD.HELP_TITLE,
      description: ONECARD.HELP_DESC,
      color: COLOR.BOT
    });

    embed.addField(ONECARD.HELP_SPECIAL_TITLE, ONECARD.HELP_SPECIAL_DESC);
    embed.addField(ONECARD.HELP_DEFEAT_TITLE, ONECARD.HELP_DEFEAT_DESC);

    await sender.send(embed);
  }
}

export default Onecard;
