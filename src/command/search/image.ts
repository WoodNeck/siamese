import { MessageEmbed } from "discord.js";
import axios, { AxiosResponse } from "axios";

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
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_USER(3),
  beforeRegister: (bot: Siamese) => bot.env.GOOGLE_SEARCH_ENGINE_ID != null && bot.env.GOOGLE_API_KEY != null,
  execute: async ctx => {
    const { bot, msg, channel, content } = ctx;
    if (!content) {
      return await bot.replyError(msg, ERROR.SEARCH.EMPTY_CONTENT);
    }

    const searchText = content;
    await axios.get(IMAGE.SEARCH_URL, {
      params: IMAGE.SEARCH_PARAMS(bot, searchText, !channel.nsfw)
    }).then(async (body: AxiosResponse<{ items: Array<{ link: string }>}>) => {
      const images = (body.data.items || []).map(result => result.link);
      if (!images.length) {
        await bot.replyError(msg, ERROR.SEARCH.EMPTY_RESULT(IMAGE.TARGET));
        return;
      }

      // Check image avaialability
      const testImage = (imageURL: string) => axios.head(imageURL, { maxRedirects: 0 })
        .then(res => {
          if (res.status !== 200) return null;
          return imageURL;
        })
        .catch(() => null);
      const result = await Promise.all(images.map(testImage));

      const pages = result.filter(imgURL => imgURL !== null)
        .map(imageUrl => new MessageEmbed().setImage(imageUrl as string));
      const menu = new Menu(ctx, { maxWaitTime: IMAGE.MENU_TIME });

      menu.setPages(pages);

      await menu.start();
    });
  }
});
