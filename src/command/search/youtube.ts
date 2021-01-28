import { google } from "googleapis";

import Siamese from "~/Siamese";
import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu from "~/core/Menu";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import { YOUTUBE } from "~/const/command/search";

export default new Command({
  name: YOUTUBE.CMD,
  description: YOUTUBE.DESC,
  usage: YOUTUBE.USAGE,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.ADD_REACTIONS,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_USER(3),
  beforeRegister: (bot: Siamese) => bot.env.GOOGLE_API_KEY != null,
  execute: async ctx => {
    const { bot, msg, content } = ctx;
    if (!content) {
      return await bot.replyError(msg, ERROR.SEARCH.EMPTY_CONTENT);
    }

    const searchResult = await google.youtube("v3").search.list({
      q: content,
      maxResults: YOUTUBE.MAX_RESULTS,
      part: ["snippet"],
      type: ["video"],
      key: bot.env.GOOGLE_API_KEY
    });
    const videos = searchResult.data.items || [];

    if (!videos.length) {
      return bot.replyError(msg, ERROR.SEARCH.EMPTY_RESULT(YOUTUBE.TARGET));
    }

    const menu = new Menu(ctx, { maxWaitTime: YOUTUBE.MENU_TIME });
    menu.setPages(videos.map(video => YOUTUBE.VIDEO_URL(video.id?.videoId || "")).filter(video => !!video));

    await menu.start();
  }
});
