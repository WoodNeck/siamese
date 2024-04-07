import { Command, CommandContext, GuildOnly } from "@siamese/core";
import { leave } from "@siamese/voice";

import { LEAVE } from "./const";

class Leave extends Command {
  public override define() {
    return {
      data: LEAVE,
      preconditions: [GuildOnly],
      sendTyping: false,
      ephemeral: true
    };
  }

  public override async execute({ ctx }: CommandContext) {
    await leave(ctx);
  }
}

export default Leave;
