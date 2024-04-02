import { COLOR } from "@siamese/color";
import { Command, CommandContext } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { EMOJI } from "@siamese/emoji";
import { strong } from "@siamese/markdown";

import { CHOOSE } from "./const";

class Choose extends Command {
  public override define() {
    return {
      data: CHOOSE,
      sendTyping: false
    };
  }

  public override async execute({ sender, getParams }: CommandContext) {
    const params = getParams<typeof CHOOSE.USAGE>();
    const args = params.filter(val => !!val) as string[];

    const lastArg = args[args.length - 1];
    const splitted = lastArg.split(/\s+/);
    if (splitted.length > 1) {
      args.splice(args.length - 1, 1, ...splitted);
    }

    // 최소 항목이 2개는 필요
    if (args.length < 2) {
      return await sender.replyError(CHOOSE.ARG_NOT_SUFFICIENT);
    }

    const choosed = args[Math.random() * args.length | 0];
    const embed = new EmbedBuilder({
      description: strong(choosed),
      color: COLOR.BOT,
      footer: {
        text: `${EMOJI.SPEECH_BUBBLE} ${args.join(" ")}`
      }
    });

    await sender.send(embed);
  }
}

export default Choose;
