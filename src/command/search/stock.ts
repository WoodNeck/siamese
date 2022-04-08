import { MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import axios, { AxiosResponse } from "axios";
import cheerio from "cheerio";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import CommandContext from "~/core/CommandContext";
import * as ERROR from "~/const/error";
import * as EMOJI from "~/const/emoji";
import * as COLOR from "~/const/color";
import * as PERMISSION from "~/const/permission";
import { STOCK } from "~/const/command/search";
import Menu, { MENU_END_REASON } from "~/core/Menu";
import { strong } from "~/util/markdown";

interface ItemSearchResult {
  query: string[];
  items: string[][][];
}

interface Item {
  id: string;
  name: string;
  type: string;
  enumType: ItemType;
  url: string;
}

enum ItemType {
  DOME_STOCK,
  DOME_SISE,
  WORLD_STOCK,
  WORLD_SISE
}

interface StockData {
  name: string;
  price: number;
  change: number;
  changePct: number;
  details: string[][];
}

interface WorldStockData {
  closePrice: string;
  compareToPreviousClosePrice: string;
  fluctuationsRatio: string;
  stockNameEng: string;
  indexNameEng: string;
  currencyType?: {
    name: string;
  };
  stockItemTotalInfos: Array<{
    code: string;
    key: string;
    value: string;
    date?: string;
  }>;
}

export default new Command({
  name: STOCK.CMD,
  description: STOCK.DESC,
  usage: STOCK.USAGE,
  alias: STOCK.ALIAS,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.ADD_REACTIONS,
    PERMISSION.READ_MESSAGE_HISTORY,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_USER(5),
  slashData: new SlashCommandBuilder()
    .setName(STOCK.CMD)
    .setDescription(STOCK.DESC)
    .addStringOption(option => option
      .setName(STOCK.USAGE)
      .setDescription(STOCK.DESC_OPTION)
      .setRequired(true)
    ) as SlashCommandBuilder,
  async execute(ctx) {
    if (ctx.isSlashCommand()) return;

    const { bot, content } = ctx;

    if (!content) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_CONTENT);
    }

    const result = await axios.get(STOCK.URL(content)) as AxiosResponse<ItemSearchResult>;
    const stockItems = result.data.items.reduce((items, item) => {
      const typedItems = item.reduce((total, typed) => {
        const url = typed[3][0];
        const enumType = toEnumType(url);

        if (enumType == null) return total;

        return [...total, toItem(typed, enumType)];
      }, [] as Item[]);

      return [...items, ...typedItems];
    }, [] as Item[]);

    if (stockItems.length <= 0) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_RESULT(STOCK.TARGET));
    }

    if (stockItems.length === 1) {
      return await fetchItem(ctx, stockItems[0]);
    }

    const selectorEmbed = stockItems.map(item => {
      const embed = new MessageEmbed();

      embed.setTitle(`${EMOJI.BAR_CHART} ${item.name}`);
      embed.setFooter({ text: `${item.type}(${item.id})` });

      return embed;
    });

    const stockSelectorMenu = new Menu(ctx);
    stockSelectorMenu.setPages(selectorEmbed);
    stockSelectorMenu.addReactionCallback({ id: "CONFIRM", emoji: EMOJI.GREEN_CHECK, style: "SECONDARY" }, () => {
      const item = stockItems[stockSelectorMenu.index];

      fetchItem(ctx, item).catch(err => {
        void bot.handleError(ctx, this, err);
      });

      return MENU_END_REASON.DELETE_ALL;
    }, 1);
    await stockSelectorMenu.start();
  }
});

const fetchItem = async (ctx: CommandContext, item: Item) => {
  if (item.enumType === ItemType.DOME_STOCK) {
    const data = await fetchDomesticStockData(item);
    await showDomesticData(ctx, item, data);
  } else if (item.enumType === ItemType.DOME_SISE) {
    const data = await fetchDomesticSiseData(item);
    await showDomesticData(ctx, item, data);
  } else if (item.enumType === ItemType.WORLD_STOCK) {
    const data = await fetchWorldStockData(item);
    await showWorldData(ctx, item, data);
  } else if (item.enumType === ItemType.WORLD_SISE) {
    const data = await fetchWorldSiseData(item);
    await showWorldData(ctx, item, data);
  }
};

const toItem = (raw: string[], enumType: ItemType) => ({
  name: raw[1][0],
  type: raw[2][0],
  id: raw[4][0],
  url: raw[3][0],
  enumType
});

const toEnumType = (url: string) => {
  const types = Object.keys(checkers);

  for (const type of types) {
    const checker = checkers[type] as RegExp;

    if (checker.test(url)) return parseInt(type, 10);
  }

  return null;
};

const checkers = {
  [ItemType.DOME_STOCK]: /domestic\/stock/,
  [ItemType.DOME_SISE]: /domestic\/index/,
  [ItemType.WORLD_STOCK]: /worldstock\/stock/,
  [ItemType.WORLD_SISE]: /worldstock\/index/
};

const fetchDomesticStockData = async (item: Item): Promise<StockData> => {
  const getHeaderInfo = axios.get(STOCK.DOME_STOCK_HEADER_URL(item.id)).then((res: AxiosResponse<{
    result: {
      al: string;
      aq: number;
      cd: string;
      cr: number;
      cv: number;
      hv: number;
      lv: number;
      ms: string;
      mt: string;
      my: number;
      nm: string;
      nt: number;
      nv: number;
      nyn: string;
      pcv: number;
      rf: string;
      time: number;
      tyn: string;
    };
  }>) => {
    const data = res.data.result;

    return {
      name: data.nm,
      price: data.nv,
      change: data.cv,
      changePct: data.cr
    };
  });
  const getMainInfo = axios.get(STOCK.DOME_STOCK_INFO_URL(item.id)).then(res => {
    const $ = cheerio.load(res.data);
    const details = $(".total_list").find("li");
    const result: string[][] = [];

    details.each((_, el) => {
      const keyEl = $(el.firstChild!);
      const valEl = $(el.lastChild!);

      const key = (keyEl[0] as any).childNodes
        ? (keyEl[0] as any).childNodes.map(child => $(child).text().trim()).join(" / ")
        : keyEl.text().trim();
      const val = (valEl[0] as any).childNodes
        ? (valEl[0] as any).childNodes.map(child => $(child).text().trim()).join(" / ")
        : valEl.text().trim();

      if (key && val) {
        result.push([key, val]);
      }
    });

    return result;
  });


  const [stockInfo, details] = await Promise.all([getHeaderInfo, getMainInfo]);

  return {
    ...stockInfo,
    details
  };
};

const fetchDomesticSiseData = async (item: Item) => await axios.get(STOCK.DOME_SISE_URL(item.id))
  .then(res => {
    const $ = cheerio.load(res.data);
    const priceWrapper = $(".price_wrp");
    const name = $(".item_wrp .elips").text().trim();
    const price = parseFloat(priceWrapper.find(".stock_price").text().trim().replace(",", ""));
    const change = parseFloat(priceWrapper.find(".gap_price .price").text().trim().replace(",", ""));
    const changePct = parseFloat(priceWrapper.find(".gap_rate .rate").text().trim().replace(",", ""));

    const detailItems = $(".total_list").find("li");
    const details: string[][] = [];

    detailItems.slice(0, -1).each((_, el) => {
      details.push(el.children.filter(child => child.type !== "text").map(child => $(child).text().trim()));
    });

    return {
      name,
      price,
      change,
      changePct,
      details
    };
  });

const fetchWorldStockData = async (item: Item) => await axios.get(STOCK.WORLD_BASIC_URL(item.id)).then(res => res.data);
const fetchWorldSiseData = async (item: Item) => await axios.get(STOCK.WORLD_SISE_URL(item.id)).then(res => res.data);

const showWorldData = async (ctx: CommandContext, item: Item, data: WorldStockData) => {
  const { bot } = ctx;
  const stockDetailsMessage = new MessageEmbed();
  const change = parseFloat(data.compareToPreviousClosePrice.replace(",", ""));
  const changePct = parseFloat(data.fluctuationsRatio.replace(",", ""));

  stockDetailsMessage.setTitle(`${change >= 0 ? EMOJI.CHART_UP : EMOJI.CHART_DOWN} ${data.stockNameEng ?? data.indexNameEng}`);
  stockDetailsMessage.setColor(COLOR.BOT);
  stockDetailsMessage.setDescription(`${strong(data.closePrice)}${data.currencyType ? ` ${data.currencyType.name}` : ""} (${change >= 0 ? EMOJI.UP_TRIANGLE : EMOJI.DOWN_TRIANGLE} ${change}, ${changePct > 0 ? `+${changePct}` : changePct}%)`);
  stockDetailsMessage.setThumbnail(STOCK.WORLD_THUMB(item.id, item.enumType === ItemType.WORLD_STOCK));
  stockDetailsMessage.setFooter({ text: `${item.type}(${item.id})` });
  stockDetailsMessage.setTimestamp();

  data.stockItemTotalInfos.forEach(detail => {
    const date = detail.date ? new Date(detail.date) : null;
    const title = date
      ? `${detail.key} (${date.getFullYear()}/${date.getMonth() + 1})`
      : detail.key;

    stockDetailsMessage.addField(title, detail.value, true);
  });

  const stockPages = Object.keys(STOCK.TIMES).map(time => {
    const page = new MessageEmbed();

    page.setTitle(`${EMOJI.BAR_CHART} ${data.stockNameEng ?? data.indexNameEng}`);
    page.setImage(STOCK.WORLD_IMAGE(item.id, STOCK.TIMES[time], item.enumType === ItemType.WORLD_STOCK));
    page.setFooter({ text: time });

    return page;
  });

  await bot.send(ctx, { embeds: [stockDetailsMessage] });

  const menu = new Menu(ctx);
  menu.setPages(stockPages);
  await menu.start();
};

const showDomesticData = async (ctx: CommandContext, item: Item, data: StockData) => {
  const { bot } = ctx;
  const stockDetailsMessage = new MessageEmbed();

  stockDetailsMessage.setTitle(`${data.change >= 0 ? EMOJI.CHART_UP : EMOJI.CHART_DOWN} ${data.name}`);
  stockDetailsMessage.setColor(COLOR.BOT);
  stockDetailsMessage.setDescription(`${strong(data.price.toString())} (${data.change >= 0 ? EMOJI.UP_TRIANGLE : EMOJI.DOWN_TRIANGLE} ${data.change}, ${data.changePct > 0 ? `+${data.changePct}` : data.changePct}%)`);
  stockDetailsMessage.setThumbnail(STOCK.DOME_THUMB(item.id));
  stockDetailsMessage.setFooter({ text: `${item.type}(${item.id})` });
  stockDetailsMessage.setTimestamp();

  data.details.forEach(detail => {
    stockDetailsMessage.addField(detail[0], detail[1], true);
  });

  const stockPages = Object.keys(STOCK.TIMES).map(time => {
    const page = new MessageEmbed();

    page.setTitle(`${EMOJI.BAR_CHART} ${data.name}`);
    page.setImage(STOCK.DOME_IMAGE(item.id, STOCK.TIMES[time]));
    page.setFooter({ text: time });

    return page;
  });

  await bot.send(ctx, { embeds: [stockDetailsMessage] });

  const menu = new Menu(ctx);
  menu.setPages(stockPages);
  await menu.start();
};
