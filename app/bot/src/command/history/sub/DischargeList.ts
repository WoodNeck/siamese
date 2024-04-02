import { CommandContext, GuildTextOnly, SubCommand } from "@siamese/core";
import { Discharge } from "@siamese/db";
import { EmbedBuilder } from "@siamese/embed";
import { Menu } from "@siamese/menu";
import { range } from "@siamese/util";
import dayjs from "dayjs";

import { DISCHARGE, DISCHARGE_LIST } from "../const";

class DischargeList extends SubCommand {
  public override define() {
    return {
      data: DISCHARGE_LIST,
      preconditions: [
        GuildTextOnly
      ]
    };
  }

  public override async execute({ ctx, sender, getGuildID }: CommandContext) {
    const guildID = getGuildID();
    if (!guildID) {
      await sender.replyError(DISCHARGE.ERROR.GUILD_NOT_FOUND);
      return;
    }

    const results = await Discharge.findAll(guildID);
    if (results.length <= 0) {
      await sender.replyError(DISCHARGE.ERROR.EMPTY_RESULT);
      return;
    }

    const infos = results.map(info => ({
      name: info.userName,
      joinDate: dayjs(info.joinDate)
    }));
    const pages: EmbedBuilder[] = [];
    const totalPages = Math.floor((results.length - 1) / DISCHARGE_LIST.ENTRY_PER_PAGE) + 1;

    for (const i of range(totalPages)) {
      const infosDesc = infos.slice(i * DISCHARGE_LIST.ENTRY_PER_PAGE, (i + 1) * DISCHARGE_LIST.ENTRY_PER_PAGE)
        .map(info => DISCHARGE_LIST.ENTRY(info))
        .join("\n");
      pages.push(new EmbedBuilder({ description: infosDesc }));
    }

    const menu = new Menu({ ctx });
    menu.setEmbedPages(pages);

    await menu.start();
  }
}

export default DischargeList;
