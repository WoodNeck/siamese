import { MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import axios from "axios";
import * as cheerio from "cheerio";

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
    const body = await axios.get(IMAGE.SEARCH_URL, {
      params: IMAGE.SEARCH_PARAMS(searchText, !channel.nsfw),
      headers: IMAGE.FAKE_HEADER
    });

    const images = findAllImages(body.data);
    if (!images.length) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_RESULT(IMAGE.TARGET));
    }

    const pages = images.map(imageUrl => new MessageEmbed().setImage(imageUrl));
    const menu = new Menu(ctx);

    menu.setPages(pages);

    await menu.start();

    // Check image avaialability
    const testImage = (imageURL: string, idx: number): Promise<number> => axios.head(imageURL, { maxRedirects: 0 })
      .then(res => {
        if (res.status !== 200) return -1;
        return idx;
      })
      .catch(({ response }) => {
        if (response && Math.floor(response.status / 100) === 3) return idx;
        return -1;
      });
    const results = await Promise.all(images.map(testImage));

    menu.updatePages(
      results.filter(idx => idx >= 0).map(idx => new MessageEmbed().setImage(images[idx])),
      results.map((_, arrIdx) => arrIdx).filter(idx => results[idx] < 0)
    );
  }
});

const findAllImages = page => {
  const $ = cheerio.load(page);
  const containsNonLatinCodepoints = /[^\u0000-\u00ff]/;

  return $(".islrtb").toArray()
    .slice(0, 10)
    .map(el => el.attribs["data-ou"])
    .filter(url => {
      try {
        const decoded = decodeURIComponent(url);
        return !containsNonLatinCodepoints.test(decoded);
      } catch (err) {
        return false;
      }
    }) as string[];
};
