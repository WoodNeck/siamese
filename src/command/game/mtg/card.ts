import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import * as Scry from "scryfall-sdk";

import { cardToEmbed } from "./utils";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu from "~/core/Menu";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import { MTG } from "~/const/command/game";

export default new Command({
  name: MTG.CARD.CMD,
  description: MTG.CARD.DESC,
  usage: MTG.CARD.USAGE,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.READ_MESSAGE_HISTORY,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_USER(5),
  slashData: new SlashCommandSubcommandBuilder()
    .setName(MTG.CARD.CMD)
    .setDescription(MTG.CARD.DESC)
    .addStringOption(option => option
      .setName(MTG.CARD.USAGE)
      .setDescription(MTG.CARD.USAGE_DESC)
      .setRequired(true)
    ) as SlashCommandSubcommandBuilder,
  execute: async ctx => {
    const { bot } = ctx;

    const searchText = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(MTG.CARD.USAGE, true)
      : ctx.content;

    const cards = (await Scry.Cards.search(searchText, {
      include_multilingual: true
    }).cancelAfterPage().waitForAll()).slice(0, 10);

    if (!cards.length) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_RESULT(MTG.CARD.CMD));
    }

    const pages = cards.map(cardToEmbed);

    const menu = new Menu(ctx);
    menu.setPages(pages);

    await menu.start();
  }
});
