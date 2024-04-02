import { Command, CommandContext, Cooldown, GuildTextOnly } from "@siamese/core";
import { TictactoeGame, createVSGameRoom } from "@siamese/minigame";

import { MINIGAME_PERMISSIONS, TICTACTOE } from "./const";

class Tictactoe extends Command {
  public override define() {
    return {
      data: TICTACTOE,
      sendTyping: false,
      permissions: MINIGAME_PERMISSIONS,
      preconditions: [
        GuildTextOnly,
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ ctx, getUser, getParams }: CommandContext) {
    const [opponent] = getParams<typeof TICTACTOE.USAGE>();
    const room = await createVSGameRoom(ctx, opponent, TICTACTOE.CMD);
    if (!room) return;

    const canStart = await room.waitForPlayers(TICTACTOE.JOIN_MSG_TITLE(getUser()));
    if (!canStart) return;

    const game = new TictactoeGame(room.getContext());
    await game.start();
  }
}

export default Tictactoe;
