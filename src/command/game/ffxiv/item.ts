import { MessageEmbed } from "discord.js";
import axios from "axios";
import * as cheerio from "cheerio";
import { SlashCommandSubcommandBuilder } from "@discordjs/builders";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu, { MENU_END_REASON } from "~/core/Menu";
import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import { FFXIV } from "~/const/command/game";
import { toValidURL } from "~/util/helper";
import CommandContext from "~/core/CommandContext";
import SlashCommandContext from "~/core/SlashCommandContext";

export default new Command({
  name: FFXIV.ITEM.CMD,
  description: FFXIV.ITEM.DESC,
  usage: FFXIV.ITEM.USAGE,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.READ_MESSAGE_HISTORY,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_USER(5),
  slashData: new SlashCommandSubcommandBuilder()
    .setName(FFXIV.ITEM.CMD)
    .setDescription(FFXIV.ITEM.DESC)
    .addStringOption(option => option
      .setName(FFXIV.ITEM.USAGE)
      .setDescription(FFXIV.ITEM.USAGE_DESC)
      .setRequired(true)
    ) as SlashCommandSubcommandBuilder,
  execute: async ctx => {
    const { bot } = ctx;

    const searchText = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(FFXIV.ITEM.USAGE, true)
      : ctx.content;

    if (!searchText) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_CONTENT);
    }

    // Search item entries first
    const entriesRes = await axios.get(FFXIV.ITEM.ENTRIES_ENDPOINT, {
      params: {
        keyword: searchText
      }
    });

    if (entriesRes.status !== 200 || !entriesRes.data) {
      return await bot.replyError(ctx, ERROR.SEARCH.FAILED);
    }

    const entriesPage = cheerio.load(entriesRes.data);
    const items = entriesPage(".base_tb").find("tr").toArray().slice(1);

    if (!items.length) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_RESULT(FFXIV.ITEM.CMD));
    }

    if (items.length > 1) {
      // Show select menu
      const pages = items.map(item => {
        const itemTR = entriesPage(item);
        const anchor = itemTR.find("a");
        const iconURL = itemTR.find("img").attr("src");

        const itemName = anchor.text();
        const itemColor = FFXIV.ITEM.COLOR[anchor.attr("class")?.trim() as any];

        const page = new MessageEmbed();

        if (itemName && iconURL) {
          page.setAuthor({
            name: itemName,
            iconURL: toValidURL(iconURL)
          });
        }

        page.setColor(itemColor ?? COLOR.BLACK);

        return page;
      }).filter(page => !!page.author);
      const menu = new Menu(ctx);

      menu.setPages(pages);
      menu.addReactionCallback({ id: "CONFIRM", emoji: EMOJI.GREEN_CHECK, style: "SECONDARY" }, () => {
        const item = items[menu.index];

        void showItemInfo(getItemURL(entriesPage(item)), ctx);

        return MENU_END_REASON.DELETE_ALL;
      }, 1);

      await menu.start();
    } else {
      void showItemInfo(getItemURL(entriesPage(items[0])), ctx);
    }
  }
});

const getItemURL = (item: cheerio.Cheerio<cheerio.Element>): string | null => {
  return item.find("a").attr("href") || null;
};

const showItemInfo = async (itemURL: string | null, ctx: CommandContext | SlashCommandContext) => {
  const { bot } = ctx;

  if (!itemURL) return await bot.replyError(ctx, ERROR.SEARCH.FAILED);

  const res = await axios.get(FFXIV.ITEM.ITEM_ENDPOINT(itemURL));

  if (res.status !== 200 || !res.data) {
    return await bot.replyError(ctx, ERROR.SEARCH.FAILED);
  }

  const $ = cheerio.load(res.data);
  const itemInfoWrapper = $(".cont_in.cont_view");
  const iconURL = toValidURL(itemInfoWrapper.find(".view_icon img").attr("src")!);
  const nameWrapper = itemInfoWrapper.find(".view_name");
  const name = nameWrapper.find("h1").text();
  const itemColor = FFXIV.ITEM.COLOR[nameWrapper.find("h1").attr("class")?.trim() as any];
  const itemType = nameWrapper.find("p").text();
  const viewBase = itemInfoWrapper.find(".view_base");

  const itemDesc = viewBase.first().text();
  const item = new MessageEmbed();

  item.setDescription(`*${itemType}*\n${itemDesc}`);
  item.setAuthor({ name, iconURL });
  item.setColor(itemColor || COLOR.BLACK);

  await bot.send(ctx, { embeds: [item] });
};
