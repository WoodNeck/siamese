import { CommandContext, Cooldown, SubCommand } from "@siamese/core";
import { Menu } from "@siamese/menu";
import { searchCards } from "@siamese/mtg";
import { cardToEmbed } from "@siamese/mtg/src/utils";

import { MTG } from "../../const";

class MtgCard extends SubCommand {
  public override define() {
    return {
      data: MTG.CARD,
      deferReply: true,
      preconditions: [
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ sender, ctx, getParams }: CommandContext) {
    const [searchText] = getParams<typeof MTG.CARD.USAGE>();
    if (!searchText) {
      await sender.replyError(MTG.CARD.EMPTY_CONTENT);
      return;
    }

    const cards = await searchCards(searchText);
    if (!cards.length) {
      await sender.replyError(MTG.CARD.EMPTY_RESULT);
      return;
    }

    const pages = cards.map(cardToEmbed);

    const menu = new Menu(ctx);
    menu.setEmbedPages(pages);
    await menu.start();
  }
}

export default MtgCard;
