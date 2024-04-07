import { Command, CommandContext, GuildOnly } from "@siamese/core";
import { join } from "@siamese/voice";

import { JOIN } from "./const";

class Join extends Command {
  public override define() {
    return {
      data: JOIN,
      preconditions: [GuildOnly],
      sendTyping: false,
      ephemeral: true
    };
  }

  public override async execute({ ctx }: CommandContext) {
    await join(ctx);
  }
}

export default Join;
