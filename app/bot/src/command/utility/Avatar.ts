import { COLOR } from "@siamese/color";
import { Command, CommandContext } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";

import { AVATAR } from "./const";

class Avatar extends Command {
  public override define() {
    return {
      data: AVATAR,
      sendTyping: false
    };
  }

  public override async execute({ sender, getParams }: CommandContext) {
    const params = getParams<typeof AVATAR.USAGE>();
    const mentioned = params[0];

    if (!mentioned) {
      return await sender.replyError(AVATAR.MENTION_NEEDED);
    }

    const embed = new EmbedBuilder({
      image: mentioned.displayAvatarURL(),
      footer: {
        text: mentioned.username,
        iconURL: mentioned.displayAvatarURL()
      },
      color: COLOR.BOT
    });

    await sender.send(embed);
  }
}

export default Avatar;
