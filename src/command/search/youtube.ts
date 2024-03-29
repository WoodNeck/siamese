import { SlashCommandBuilder } from "@discordjs/builders";
import { google } from "googleapis";

import Siamese from "~/Siamese";
import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import ReactionMenu from "~/core/ReactionMenu";
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
    PERMISSION.READ_MESSAGE_HISTORY,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_USER(3),
  beforeRegister: (bot: Siamese) => bot.env.GOOGLE_API_KEY != null,
  slashData: new SlashCommandBuilder()
    .setName(YOUTUBE.CMD)
    .setDescription(YOUTUBE.DESC)
    .addStringOption(option => option
      .setName(YOUTUBE.USAGE)
      .setDescription(YOUTUBE.DESC_OPTION)
      .setRequired(true)
    ) as SlashCommandBuilder,
  execute: async ctx => {
    const { bot } = ctx;
    const content = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(YOUTUBE.USAGE, true)
      : ctx.content;

    if (!content) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_CONTENT);
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
      return bot.replyError(ctx, ERROR.SEARCH.EMPTY_RESULT(YOUTUBE.TARGET));
    }

    const menu = new ReactionMenu(ctx);
    menu.setPages(videos.map(video => YOUTUBE.VIDEO_URL(video.id?.videoId || "")).filter(video => !!video));

    await menu.start();
  }
});
