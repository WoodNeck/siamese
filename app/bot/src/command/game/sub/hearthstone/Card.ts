import { searchHearthstoneCard } from "@siamese/battlenet";
import { CommandContext, Cooldown, SubCommand } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { Menu } from "@siamese/menu";

import { HEARTHSTONE } from "../../const";

class HearthstoneCard extends SubCommand {
  public override define() {
    return {
      data: HEARTHSTONE.CARD,
      deferReply: true,
      preconditions: [
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ sender, ctx, getParams }: CommandContext) {
    const [searchText] = getParams<typeof HEARTHSTONE.CARD.USAGE>();
    if (!searchText) {
      await sender.replyError(HEARTHSTONE.CARD.EMPTY_CONTENT);
      return;
    }

    const cards = await searchHearthstoneCard(searchText);
    if (cards.length <= 0) {
      await sender.replyError(HEARTHSTONE.CARD.EMPTY_RESULT);
      return;
    }

    const pages = cards.map(card => {
      const embed = new EmbedBuilder({
        description: card.flavorText,
        image: card.image,
        footer: { text: card.name }
      });

      const rarityColor = HEARTHSTONE.CARD.RARITY_COLOR[card.rarityId];
      if (rarityColor) {
        embed.setColor(rarityColor);
      }

      return embed;
    });

    const menu = new Menu(ctx);
    menu.setEmbedPages(pages);
    await menu.start();
  }
}

export default HearthstoneCard;
