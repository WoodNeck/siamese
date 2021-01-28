import { MessageEmbed } from "discord.js";
import axios, { AxiosResponse } from "axios";

import Siamese from "~/Siamese";
import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu from "~/core/Menu";
import * as ERROR from "~/const/error";
import * as COLOR from "~/const/color";
import * as PERMISSION from "~/const/permission";
import { SHOPPING } from "~/const/command/search";
import { NAVER_HEADER } from "~/const/header";

export default new Command({
  name: SHOPPING.CMD,
  description: SHOPPING.DESC,
  usage: SHOPPING.USAGE,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.ADD_REACTIONS,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_USER(5),
  beforeRegister: (bot: Siamese) => bot.env.NAVER_ID != null && bot.env.NAVER_SECRET != null,
  execute: async ctx => {
    const { bot, msg, content } = ctx;

    if (!content) {
      return await bot.replyError(msg, ERROR.SEARCH.EMPTY_CONTENT);
    }

    await axios.get(SHOPPING.SEARCH_URL, {
      params: SHOPPING.SEARCH_PARAMS(content),
      headers: NAVER_HEADER(bot)
    }).then(async (body: AxiosResponse<{
      total: number;
      items: Array<{
        title: string;
        total: number;
        lprice: string;
        hprice: string;
        productType: number;
        link: string;
        mallName: string;
        image: string;
      }>;
    }>) => {
      if (!body.data.total) {
        return await bot.replyError(msg, ERROR.SEARCH.EMPTY_RESULT(SHOPPING.TARGET));
      }

      const items = body.data.items;
      const pages = items.map(item => {
        // Result emphasis query with <b></b> tag, so have to escape it
        const bTag = /<(\/)*b>/gi;
        const title = item.title.replace(bTag, "");
        const price = SHOPPING.PRICE(
          parseInt(item.lprice, 10),
          parseInt(item.hprice, 10)
        );
        const productType = SHOPPING.PRODUCT_TYPE[item.productType] as string;

        return new MessageEmbed()
          .setTitle(title)
          .setDescription(price)
          .setURL(item.link)
          .setFooter(`${item.mallName} - ${productType}`, SHOPPING.ICON)
          .setThumbnail(item.image)
          .setColor(COLOR.BOT);
      });

      const menu = new Menu(ctx, { maxWaitTime: SHOPPING.MENU_TIME });
      menu.setPages(pages);

      await menu.start();
    });
  }
});
