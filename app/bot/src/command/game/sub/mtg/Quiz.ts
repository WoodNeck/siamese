import { CommandContext, Cooldown, SubCommand } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { blurCardName, cardToQuizEmbed, getRandomQuizCard } from "@siamese/mtg";

import { MTG } from "../../const";

class MtgQuiz extends SubCommand {
  public override define() {
    return {
      data: MTG.QUIZ,
      deferReply: true,
      preconditions: [
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ sender }: CommandContext) {
    const card = await getRandomQuizCard();
    const embed = cardToQuizEmbed(card);

    await sender.send(embed);
    const msg = await sender.waitTextResponse(MTG.QUIZ.MAX_TIME);

    const origName = card.printed_name ?? card.name;
    const image = card.image_uris ? card.image_uris.large : null;

    const isCorrectAnswer = msg && blurCardName(msg) === blurCardName(origName);
    const resultEmbed = new EmbedBuilder({
      title: isCorrectAnswer ? MTG.QUIZ.OK_TEXT : MTG.QUIZ.NO_TEXT(origName)
    });

    if (image) {
      resultEmbed.setImage(image);
    }

    await sender.send(resultEmbed);
  }
}

export default MtgQuiz;
