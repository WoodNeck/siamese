import { MessageEmbed } from "discord.js";
import axios, { AxiosResponse } from "axios";

import Siamese from "~/Siamese";
import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu from "~/core/Menu";
import * as ERROR from "~/const/error";
import * as EMOJI from "~/const/emoji";
import * as PERMISSION from "~/const/permission";
import { KIN } from "~/const/command/search";
import { NAVER_HEADER } from "~/const/header";
import { link } from "~/util/markdown";

export default new Command({
  name: KIN.CMD,
  description: KIN.DESC,
  usage: KIN.USAGE,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.ADD_REACTIONS,
    PERMISSION.READ_MESSAGE_HISTORY,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_USER(5),
  beforeRegister: (bot: Siamese) => bot.env.NAVER_ID != null && bot.env.NAVER_SECRET != null,
  execute: async ctx => {
    const { bot, msg, content } = ctx;

    if (!content) {
      return bot.replyError(msg, ERROR.SEARCH.EMPTY_CONTENT);
    }

    await axios.get(KIN.SEARCH_URL, {
      params: KIN.SEARCH_PARAMS(content),
      headers: NAVER_HEADER(bot)
    }).then(async (body: AxiosResponse<{
      total: number;
      items: Array<{
        title: string;
        description: string;
        link: string;
      }>;
    }>) => {
      if (!body.data.total) {
        return await bot.replyError(msg, ERROR.SEARCH.EMPTY_RESULT(KIN.TARGET));
      }

      const items = body.data.items;
      const pages: MessageEmbed[] = [];
      const totalPagesCount = Math.floor((items.length - 1) / KIN.ITEMS_PER_PAGE) + 1;

      for (let pageIdx = 0; pageIdx < totalPagesCount; pageIdx++) {
        const page = new MessageEmbed();
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
        page.setFooter(KIN.SERVICE_NAME, KIN.ICON);

        pages.push(page);
      }

      const menu = new Menu(ctx, { maxWaitTime: KIN.MENU_TIME });
      menu.setPages(pages);

      await menu.start();
    });
  }
});
