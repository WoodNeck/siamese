import { Command, CommandContext, Cooldown, GuildTextOnly } from "@siamese/core";
import { Connect5Game, createVSGameRoom } from "@siamese/minigame";

import { CONNECT5, MINIGAME_PERMISSIONS } from "./const";

class Connect5 extends Command {
  public override define() {
    return {
      data: CONNECT5,
      sendTyping: false,
      permissions: MINIGAME_PERMISSIONS,
      preconditions: [
        GuildTextOnly,
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ ctx, getUser, getParams }: CommandContext) {
    const [opponent] = getParams<typeof CONNECT5.USAGE>();
    const room = await createVSGameRoom(ctx, opponent, CONNECT5.CMD);
    if (!room) return;

    const canStart = await room.waitForPlayers(CONNECT5.JOIN_MSG_TITLE(getUser()));
    if (!canStart) return;

    const game = new Connect5Game(room.getContext());
    await game.start();
  }
}

export default Connect5;
