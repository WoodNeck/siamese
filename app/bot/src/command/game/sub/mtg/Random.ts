import { CommandContext, Cooldown, SubCommand } from "@siamese/core";
import { cardToEmbed, getRandomQuizCard } from "@siamese/mtg";

import { MTG } from "../../const";

class MtgRandom extends SubCommand {
  public override define() {
    return {
      data: MTG.RANDOM,
      deferReply: true,
      preconditions: [
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ sender }: CommandContext) {
    const card = await getRandomQuizCard();
    const embed = cardToEmbed(card);

    await sender.send(embed);
  }
}

export default MtgRandom;

