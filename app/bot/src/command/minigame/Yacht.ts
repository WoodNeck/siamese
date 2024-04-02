import { Command, CommandContext, Cooldown, GuildTextOnly } from "@siamese/core";
import { YachtGame, createVSGameRoom } from "@siamese/minigame";

import { YACHT, MINIGAME_PERMISSIONS } from "./const";

class Yacht extends Command {
  public override define() {
    return {
      data: YACHT,
      sendTyping: false,
      permissions: MINIGAME_PERMISSIONS,
      preconditions: [
        GuildTextOnly,
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ ctx, getUser, getParams }: CommandContext) {
    const [opponent] = getParams<typeof YACHT.USAGE>();
    const room = await createVSGameRoom(ctx, opponent, YACHT.CMD);
    if (!room) return;

    const canStart = await room.waitForPlayers(YACHT.JOIN_MSG_TITLE(getUser()));
    if (!canStart) return;

    const game = new YachtGame(room.getContext());
    await game.start();
  }
}

export default Yacht;
