import { MessageEmbed } from "discord.js";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu from "~/core/Menu";
import * as PERMISSION from "~/const/permission";
import { TRANSLATE } from "~/const/command/utility";

export default new Command({
  name: TRANSLATE.LIST.CMD,
  description: TRANSLATE.LIST.DESC,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.ADD_REACTIONS,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_USER(5),
  execute: async ctx => {
    const langs = Object.keys(TRANSLATE.LANGS);
    const pages: MessageEmbed[] = [];
    const totalPageCnt = Math.floor((langs.length - 1) / TRANSLATE.LIST.ENTRY_PER_PAGE);

    for (let idx = 0; idx < totalPageCnt; idx++) {
      const infosDesc = langs.slice(idx * TRANSLATE.LIST.ENTRY_PER_PAGE, (idx + 1) * TRANSLATE.LIST.ENTRY_PER_PAGE)
        .map(info => TRANSLATE.LIST.ENTRY(info))
        .join("\n");
      pages.push(new MessageEmbed().setDescription(infosDesc));
    }

    const menu = new Menu(ctx, { maxWaitTime: TRANSLATE.LIST.MENU_TIME });
    menu.setPages(pages);

    await menu.start();
  }
});
