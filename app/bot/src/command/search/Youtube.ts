import { Command, CommandContext, Cooldown } from "@siamese/core";
import { EMOJI } from "@siamese/emoji";
import { searchVideos } from "@siamese/google";
import { code } from "@siamese/markdown";
import { Menu } from "@siamese/menu";
import { stripIndents } from "common-tags";

import { YOUTUBE } from "./const";

class Youtube extends Command {
  public override define() {
    return {
      data: YOUTUBE,
      deferReply: true,
      preconditions: [
        new Cooldown(3)
      ]
    };
  }

  public override async execute({ sender, ctx, getParams }: CommandContext) {
    const [searchText] = getParams<typeof YOUTUBE.USAGE>();

    if (!searchText) {
      await sender.replyError(YOUTUBE.EMPTY_CONTENT);
      return;
    }

    const videos = await searchVideos(searchText);

    if (videos.length <= 0) {
      await sender.replyError(YOUTUBE.EMPTY_RESULT);
      return;
    }

    const pages = videos.map(video => {
      const meta = [
        `${EMOJI.CLOCK_3}${video.duration.text}`,
        video.view_count.text,
        video.published.text
      ].filter(val => !!val).join(` ${EMOJI.MIDDLE_DOT} `);

      return stripIndents`
        ${YOUTUBE.VIDEO_URL(video.id)}
        ${code(meta)}
      `;
    });

    const menu = new Menu({ ctx });

    menu.setContentPages(pages);

    await menu.start();
  }
}

export default Youtube;
