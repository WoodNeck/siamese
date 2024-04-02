import { Command, PERMISSION, TextCommandContext } from "@siamese/core";

import { SAY } from "./const";

class Say extends Command {
  public override define() {
    return {
      data: SAY,
      permissions: [
        PERMISSION.MANAGE_MESSAGES
      ],
      textOnly: true,
      sendTyping: false
    };
  }

  public override async execute({ sender, getParams }: TextCommandContext) {
    const [content] = getParams<typeof SAY.USAGE>();

    if (!content) {
      await sender.replyError(SAY.NO_EMPTY_CONTENT);
      return;
    }

    await sender.delete();
    await sender.send(content);
  }
}

export default Say;
