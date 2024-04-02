import { Command, CommandContext, Cooldown, GuildTextOnly } from "@siamese/core";
import { OthelloGame, createVSGameRoom } from "@siamese/minigame";

import { OTHELLO, MINIGAME_PERMISSIONS } from "./const";

class Othello extends Command {
  public override define() {
    return {
      data: OTHELLO,
      sendTyping: false,
      permissions: MINIGAME_PERMISSIONS,
      preconditions: [
        GuildTextOnly,
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ ctx, getUser, getParams }: CommandContext) {
    const [opponent] = getParams<typeof OTHELLO.USAGE>();
    const room = await createVSGameRoom(ctx, opponent, OTHELLO.CMD);
    if (!room) return;

    const canStart = await room.waitForPlayers(OTHELLO.JOIN_MSG_TITLE(getUser()));
    if (!canStart) return;

    const game = new OthelloGame(room.getContext());
    await game.start();
  }
}

export default Othello;
