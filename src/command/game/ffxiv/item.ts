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
import { range, toValidURL } from "~/util/helper";
import CommandContext from "~/core/CommandContext";
import SlashCommandContext from "~/core/SlashCommandContext";
import { block } from "~/util/markdown";

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
  const itemColor = FFXIV.ITEM.COLOR[nameWrapper.find("h1").attr("class")?.split(" ").find(val => /^col/.test(val)) as any];
  const itemType = `*${nameWrapper.find("p").text()}*`;
  const viewBase = itemInfoWrapper.find(".view_base:not([name])");
  const itemStat = itemInfoWrapper.find(".item_stat");
  const itemCondition = `${itemInfoWrapper.find(".item_condition").text().split("\n").map(val => val.trim()).filter(val => !!val).join(" / ")}`;
  const itemDesc = viewBase.first().text();

  const hasHQ = itemInfoWrapper.find(".hq_icon").length > 0;

  const item = new MessageEmbed();

  addItemStat(itemStat, item);
  addItemAdditional(itemInfoWrapper, item);

  viewBase.slice(1).each((_, vb) => {
    addViewBase($(vb), item);
  });

  item.setDescription([itemType, itemDesc, itemCondition].filter(val => !!val).join("\n"));
  item.setTitle(name);
  item.setURL(FFXIV.ITEM.ITEM_ENDPOINT(itemURL));
  item.setThumbnail(iconURL);
  item.setColor(itemColor || COLOR.BLACK);

  if (hasHQ) {
    item.setFooter({ text: FFXIV.ITEM.HQ_ITEM_FOOTER, iconURL: FFXIV.ITEM.HQ_ITEM_IMAGE });
  }

  await bot.send(ctx, { embeds: [item] });
};

const addItemStat = (itemStat: cheerio.Cheerio<cheerio.Element>, embed: MessageEmbed) => {
  if (!itemStat.length) return;

  const hq = itemStat.find("ul[name=\"hq\"]");
  const nq = itemStat.find("ul[name=\"nq\"]");

  if (!hq.length && !nq.length) return;

  try {
    const categories = nq.find(".st_kind").toArray().reverse();
    const nqValues = nq.find(".st_value").toArray().reverse();
    const hqValues = hq.find(".st_value").toArray().reverse();

    categories.forEach((category, idx) => {
      const categoryName = (category.firstChild as any)?.data;
      const nqValue = (nqValues[idx].firstChild as any)?.data;
      const hqValue = (hqValues[idx]?.firstChild as any)?.data;

      embed.addField(categoryName, hqValue ? `${nqValue}(${hqValue}\\*)` : `${nqValue}`, true);
    });
  } catch (err) {} // eslint-disable-line no-empty
};

const addItemAdditional = (wrapper: cheerio.Cheerio<cheerio.Element>, embed: MessageEmbed) => {
  const nqProp = wrapper.find(".view_base[name=\"nq\"]");
  const hqProp = wrapper.find(".view_base[name=\"hq\"]");

  if (!nqProp.length && !hqProp.length) return;

  try {
    const title = nqProp.find("h2").text();
    const nqProps = nqProp.find("p").toArray()
      .map(el => (el.firstChild! as any).data);
    const hqProps = hqProp.find("p").toArray()
      .map(el => (el.firstChild! as any).data)
      .map(text => /\d+/.exec(text)![0]);

    const props = hqProps.length
      ? nqProps.map((prop, idx) => `${prop}(${hqProps[idx]}*)`)
      : nqProps;

    const desc = range(Math.ceil(props.length / 2)).map(idx => props.slice(idx * 2, idx * 2 + 2).join(" ")).join("\n");

    embed.addField(title, block(desc, "js"), false);
  } catch (err) {} // eslint-disable-line no-empty
};

const addViewBase = (viewBase: cheerio.Cheerio<cheerio.Element>, embed: MessageEmbed) => {
  const title = viewBase.find("h2").text().trim() || EMOJI.ZERO_WIDTH_SPACE;
  const materiaEls = viewBase.find(".materia");

  try {
    if (materiaEls.length) {
      embed.addField(title, EMOJI.CIRCLE.HOLLOW.repeat(materiaEls.length), false);
    } else {
      const p = viewBase.find("p:not([name])").toArray();

      const halfTable = p.filter(el => el.attribs.class?.includes("second_col")).map(el => cheerio.default.text([el]));
      const list = p.filter(el => el.attribs.class?.includes("third_col")).map(el => cheerio.default.text([el]));

      const tableContents = range(Math.ceil(halfTable.length / 2)).map(idx => halfTable.slice(idx * 2, idx * 2 + 2).join(" - ")).map(text => `${EMOJI.MIDDLE_DOT} ${text}`).join("\n");
      const listContents = range(Math.ceil(list.length / 3)).map(idx => list.slice(idx * 3, idx * 3 + 3).join(" / ")).join("\n");

      const desc = `${tableContents}\n${listContents}`.trim();

      if (!title || !desc) return;

      embed.addField(title, desc, false);
    }
  } catch (err) {} // eslint-disable-line no-empty
};
