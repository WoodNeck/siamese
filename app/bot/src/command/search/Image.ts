import { Command, CommandContext, Cooldown } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { searchImages } from "@siamese/google";
import { Menu } from "@siamese/menu";

import { IMAGE } from "./const";

class Image extends Command {
  public override define() {
    return {
      data: IMAGE,
      deferReply: true,
      preconditions: [
        new Cooldown(3)
      ]
    };
  }

  public override async execute({ sender, ctx, inNSFWChannel, getParams }: CommandContext) {
    const [searchText] = getParams<typeof IMAGE.USAGE>();

    if (!searchText) {
      await sender.replyError(IMAGE.EMPTY_CONTENT);
      return;
    }

    const nsfw = inNSFWChannel();
    const images = await searchImages(searchText, nsfw);

    if (!images.length) {
      await sender.replyError(IMAGE.EMPTY_RESULT);
      return;
    }

    const pages = images.map(image => new EmbedBuilder({ image }));
    const menu = new Menu({ ctx });

    menu.setEmbedPages(pages);

    await menu.start();
  }
}

export default Image;

