import { COLOR } from "@siamese/color";
import { Command, CommandContext, Cooldown } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { Menu } from "@siamese/menu";
import { searchShoppingItems } from "@siamese/naver";

import { SHOPPING } from "./const";

class Shopping extends Command {
  public override define() {
    return {
      data: SHOPPING,
      deferReply: true,
      preconditions: [
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ sender, ctx, getParams }: CommandContext) {
    const [searchText] = getParams<typeof SHOPPING.USAGE>();

    if (!searchText) {
      await sender.replyError(SHOPPING.EMPTY_CONTENT);
      return;
    }

    const items = await searchShoppingItems(searchText);
    if (items.length <= 0) {
      await sender.replyError(SHOPPING.EMPTY_RESULT);
      return;
    }

    const pages = items.map(item => {
      const price = SHOPPING.PRICE(item.lprice, item.hprice);

      return new EmbedBuilder()
        .setTitle(item.title)
        .setDescription(price)
        .setURL(item.link)
        .setFooter({
          text: `${item.mallName} - ${item.type}`,
          iconURL: SHOPPING.ICON
        })
        .setThumbnail(item.image)
        .setColor(COLOR.BOT);
    });

    const menu = new Menu({ ctx });
    menu.setEmbedPages(pages);

    await menu.start();
  }
}

export default Shopping;
