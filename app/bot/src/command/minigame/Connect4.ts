import { Command, CommandContext, Cooldown, GuildTextOnly } from "@siamese/core";
import { Connect4Game, createVSGameRoom } from "@siamese/minigame";

import { CONNECT4, MINIGAME_PERMISSIONS } from "./const";

class Connect4 extends Command {
  public override define() {
    return {
      data: CONNECT4,
      sendTyping: false,
      permissions: MINIGAME_PERMISSIONS,
      preconditions: [
        GuildTextOnly,
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ ctx, getUser, getParams }: CommandContext) {
    const [opponent] = getParams<typeof CONNECT4.USAGE>();

    const room = await createVSGameRoom(ctx, opponent, CONNECT4.CMD);
    if (!room) return;

    const canStart = await room.waitForPlayers(CONNECT4.JOIN_MSG_TITLE(getUser()));
    if (!canStart) return;

    const game = new Connect4Game(room.getContext());
    await game.start();
  }
}

export default Connect4;
