import { MessageEmbed } from "discord.js";
import { SlashCommandSubcommandBuilder  } from "@discordjs/builders";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu from "~/core/Menu";
import Discharge, { DischargeDocument } from "~/model/Discharge";
import * as PERMISSION from "~/const/permission";
import { DISCHARGE } from "~/const/command/history";

export default new Command({
  name: DISCHARGE.LIST.CMD,
  description: DISCHARGE.LIST.DESC,
  permissions: [PERMISSION.EMBED_LINKS],
  cooldown: Cooldown.PER_CHANNEL(5),
  slashData: new SlashCommandSubcommandBuilder()
    .setName(DISCHARGE.LIST.CMD)
    .setDescription(DISCHARGE.LIST.DESC),
  execute: async ctx => {
    const { bot, guild } = ctx;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const results = await Discharge.find({ guildID: guild.id }).lean().exec() as DischargeDocument[];

    if (!results) {
      return await bot.replyError(ctx, DISCHARGE.ERROR.EMPTY_RESULT);
    }

    const infos = results.map(info => ({
      name: info.userName,
      joinDate: new Date(info.joinDate)
    }));
    const pages: MessageEmbed[] = [];
    const totalPages = Math.floor((results.length - 1) / DISCHARGE.LIST.ENTRY_PER_PAGE) + 1;

    for (const i of [...Array(totalPages).keys()]) {
      const infosDesc = infos.slice(i * DISCHARGE.LIST.ENTRY_PER_PAGE, (i + 1) * DISCHARGE.LIST.ENTRY_PER_PAGE)
        .map(info => DISCHARGE.LIST.ENTRY(info))
        .join("\n");
      pages.push(new MessageEmbed().setDescription(infosDesc));
    }

    const menu = new Menu(ctx);
    menu.setPages(pages);

    await menu.start();
  }
});
