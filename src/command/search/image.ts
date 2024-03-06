import { MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import axios from "axios";
import * as cheerio from "cheerio";
import gis from "async-g-i-s";

import Siamese from "~/Siamese";
import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu from "~/core/Menu";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import { IMAGE } from "~/const/command/search";

export default new Command({
  name: IMAGE.CMD,
  description: IMAGE.DESC,
  usage: IMAGE.USAGE,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.ADD_REACTIONS,
    PERMISSION.READ_MESSAGE_HISTORY,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_USER(3),
  beforeRegister: (bot: Siamese) => bot.env.GOOGLE_SEARCH_ENGINE_ID != null && bot.env.GOOGLE_API_KEY != null,
  slashData: new SlashCommandBuilder()
    .setName(IMAGE.CMD)
    .setDescription(IMAGE.DESC)
    .addStringOption(option => option
      .setName(IMAGE.USAGE)
      .setDescription(IMAGE.DESC_OPTION)
      .setRequired(true)
    ) as SlashCommandBuilder,
  execute: async ctx => {
    const { bot, channel } = ctx;

    const content = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(IMAGE.USAGE, true)
      : ctx.content;

    if (!content) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_CONTENT);
    }

    const searchText = content;
    const images = await searchImages(searchText, channel.nsfw);

    if (!images.length) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_RESULT(IMAGE.TARGET));
    }

    const pages = images.map(image => new MessageEmbed().setImage(image));
    const menu = new Menu(ctx);

    menu.setPages(pages);

    await menu.start();
  }
});

const searchImages = async (searchText: string, nsfw: boolean) => {
  const images = await gis(searchText, { query: IMAGE.SEARCH_PARAMS(searchText, !nsfw)});

  return images
    .map(img => img.url)
    .filter(filterImage);
};

const containsNonLatinCodepoints = /[^\u0000-\u00ff]/;
const filterImage = (url: string) => {
  const inBlacklist = IMAGE.EXCLUDE_RESULT.some(regex => {
    return regex.test(url);
  });

  if (inBlacklist) return false;

  try {
    const decoded = decodeURIComponent(url);
    return !containsNonLatinCodepoints.test(decoded);
  } catch (err) {
    return false;
  }
};
