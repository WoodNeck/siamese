import { Command, CommandContext, Cooldown } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { EMOJI } from "@siamese/emoji";
import { link } from "@siamese/markdown";
import { Menu } from "@siamese/menu";
import { searchNaverKin } from "@siamese/naver";

import { KIN } from "./const";

class Kin extends Command {
  public override define() {
    return {
      data: KIN,
      deferReply: true,
      preconditions: [
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ sender, ctx, getParams }: CommandContext) {
    const [searchText] = getParams<typeof KIN.USAGE>();

    if (!searchText) {
      await sender.replyError(KIN.EMPTY_CONTENT);
      return;
    }

    const items = await searchNaverKin(searchText);
    if (items.length <= 0) {
      await sender.replyError(KIN.EMPTY_RESULT);
      return;
    }

    const pages: EmbedBuilder[] = [];
    const totalPagesCount = Math.floor((items.length - 1) / KIN.ITEMS_PER_PAGE) + 1;

    for (let pageIdx = 0; pageIdx < totalPagesCount; pageIdx++) {
      const page = new EmbedBuilder({
        title: `${EMOJI.QUESTION_MARK} ${searchText}`
      });
      const bTag = /<(\/)*b>/gi;

      page.setDescription(
        items.slice(pageIdx * KIN.ITEMS_PER_PAGE, (pageIdx + 1) * KIN.ITEMS_PER_PAGE)
          .map(item => {
            const title = link(item.title.replace(bTag, ""), item.link);
            const desc = item.description.replace(bTag, "");

            return `${EMOJI.SMALL_WHITE_SQUARE} ${title}\n${desc}`;
          })
          .join("\n\n")
      );
      page.setFooter({
        text: KIN.SERVICE_NAME,
        iconURL: KIN.ICON
      });

      pages.push(page);
    }

    const menu = new Menu({ ctx });
    menu.setEmbedPages(pages);

    await menu.start();
  }
}

export default Kin;
