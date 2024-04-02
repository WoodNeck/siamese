import { COLOR } from "@siamese/color";
import { AutocompleteContext, Command, CommandContext, Cooldown } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { EMOJI } from "@siamese/emoji";
import { strong } from "@siamese/markdown";
import { MENU_END_REASON, Menu } from "@siamese/menu";
import axios, { type AxiosResponse } from "axios";
import { load } from "cheerio";

import { STOCK } from "./const";

interface ItemSearchResult {
  isSuccess: boolean;
  detailCode: string;
  message: string;
  result: {
    query: string;
    items: Array<{
      code: string;
      name: string;
      typeCode: string;
      typeName: string;
      url: string;
      reutersCode: string;
      nationCode: string;
      nationName: string;
    }>;
  };
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

const ITEM_TYPE_REGEX: Record<number | string, RegExp> = {
  [ItemType.DOME_STOCK]: /domestic\/stock/,
  [ItemType.DOME_SISE]: /domestic\/index/,
  [ItemType.WORLD_STOCK]: /worldstock\/stock/,
  [ItemType.WORLD_SISE]: /worldstock\/index/
};

class Stock extends Command {
  public override define() {
    return {
      data: STOCK,
      deferReply: true,
      preconditions: [
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ ctx, sender, getParams }: CommandContext) {
    const [content] = getParams<typeof STOCK.USAGE>();

    if (!content) {
      await sender.replyError(STOCK.EMPTY_CONTENT);
      return;
    }

    const result = await axios.get(STOCK.URL(content)) as AxiosResponse<ItemSearchResult>;
    const stockItems = result.data.result.items.map(item => {
      const enumType = this._toEnumType(item.url);
      if (enumType == null) return null;

      return {
        name: item.name,
        type: item.typeName,
        id: item.code,
        url: item.url,
        enumType
      };
    }).filter(val => !!val) as Item[];

    if (stockItems.length <= 0) {
      await sender.replyError(STOCK.EMPTY_RESULT);
      return;
    }

    if (stockItems.length === 1) {
      return await this._fetchItem(ctx, stockItems[0]);
    }

    const selectorEmbed = stockItems.map(item => {
      const embed = new EmbedBuilder();

      embed.setTitle(`${EMOJI.BAR_CHART} ${item.name}`);
      embed.setFooter({ text: `${item.type}(${item.id})` });

      return embed;
    });

    const stockSelectorMenu = new Menu({ ctx });
    stockSelectorMenu.setEmbedPages(selectorEmbed);
    stockSelectorMenu.addButton({
      id: "CONFIRM",
      emoji: EMOJI.GREEN_CHECK,
      callback: async () => {
        const item = stockItems[stockSelectorMenu.getCurrentPageIndex()];

        try {
          await this._fetchItem(ctx, item);
        } catch (err) {
          ctx.bot.logger.error(new Error(`주식 선택 메뉴의 커스텀 버튼 오류: ${err}`));
        }

        return MENU_END_REASON.DELETE_ALL;
      }
    }, 1);
    await stockSelectorMenu.start();
  }

  public async autocomplete({ content, respond }: AutocompleteContext): Promise<void> {
    const { data } = await axios.get(STOCK.URL(content)) as AxiosResponse<ItemSearchResult>;

    await respond(data.result.items.map(({ name }) => ({ name, value: name })));
  }

  private async _fetchItem(ctx: CommandContext, item: Item) {
    if (item.enumType === ItemType.DOME_STOCK) {
      const data = await this._fetchDomesticStockData(item);
      await this._showDomesticData(ctx, item, data);
    } else if (item.enumType === ItemType.DOME_SISE) {
      const data = await this._fetchDomesticSiseData(item);
      await this._showDomesticData(ctx, item, data);
    } else if (item.enumType === ItemType.WORLD_STOCK) {
      const data = await this._fetchWorldStockData(item);
      await this._showWorldData(ctx, item, data);
    } else if (item.enumType === ItemType.WORLD_SISE) {
      const data = await this._fetchWorldSiseData(item);
      await this._showWorldData(ctx, item, data);
    }
  }

  private _toEnumType(url: string) {
    const types = Object.keys(ITEM_TYPE_REGEX);

    for (const type of types) {
      const checker = ITEM_TYPE_REGEX[type] as RegExp;

      if (checker.test(url)) return parseInt(type, 10);
    }

    return null;
  }

  private async _fetchDomesticStockData(item: Item): Promise<StockData> {
    const getHeaderInfo = axios.get(STOCK.DOME_BASIC_URL(item.id)).then((res: AxiosResponse<{
      closePrice: string;
      stockName: string;
      compareToPreviousClosePrice: string;
      fluctuationsRatio: string;
    }>) => {
      const data = res.data;

      return {
        name: data.stockName,
        price: parseFloat(data.closePrice.replace(/,/g, "")),
        change: parseFloat(data.compareToPreviousClosePrice.replace(/,/g, "")),
        changePct: parseFloat(data.fluctuationsRatio)
      };
    });
    const getMainInfo = axios.get(STOCK.DOME_STOCK_INFO_URL(item.id)).then(res => {
      const $ = load(res.data);
      const details = $(".total_list").find("li");
      const result: string[][] = [];

      details.each((_, el) => {
        const keyEl = $(el.firstChild!);
        const valEl = $(el.lastChild!);

        /* eslint-disable @typescript-eslint/no-explicit-any */
        const key = (keyEl[0] as any).childNodes
          ? (keyEl[0] as any).childNodes.map((child: any) => $(child).text().trim()).join(" / ")
          : keyEl.text().trim();
        const val = (valEl[0] as any).childNodes
          ? (valEl[0] as any).childNodes.map((child: any) => $(child).text().trim()).join(" / ")
          : valEl.text().trim();
        /* eslint-enable @typescript-eslint/no-explicit-any */

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
  }

  private async _fetchDomesticSiseData(item: Item) {
    return await axios.get(STOCK.DOME_SISE_URL(item.id))
      .then(res => {
        const $ = load(res.data);
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
  }

  private async _fetchWorldStockData(item: Item) {
    return await axios.get(STOCK.WORLD_BASIC_URL(item.id)).then(res => res.data);
  }
  private async _fetchWorldSiseData(item: Item) {
    return await axios.get(STOCK.WORLD_SISE_URL(item.id)).then(res => res.data);
  }

  private async _showWorldData(ctx: CommandContext, item: Item, data: WorldStockData) {
    const stockDetailsMessage = new EmbedBuilder();
    const change = parseFloat(data.compareToPreviousClosePrice.replace(",", ""));
    const changePct = parseFloat(data.fluctuationsRatio.replace(",", ""));

    stockDetailsMessage.setTitle(`${change >= 0 ? EMOJI.CHART_UP : EMOJI.CHART_DOWN} ${data.stockNameEng ?? data.indexNameEng}`);
    stockDetailsMessage.setColor(COLOR.BOT);
    stockDetailsMessage.setDescription(`${strong(data.closePrice)}${data.currencyType ? ` ${data.currencyType.name}` : ""} (${change >= 0 ? EMOJI.UP_TRIANGLE : EMOJI.DOWN_TRIANGLE} ${change}, ${changePct > 0 ? `+${changePct}` : changePct}%)`);
    stockDetailsMessage.setThumbnail(STOCK.WORLD_THUMB(item.id, item.enumType === ItemType.WORLD_STOCK));
    stockDetailsMessage.setFooter({ text: `${item.type}(${item.id})` });
    stockDetailsMessage.setTimestamp(Date.now());

    data.stockItemTotalInfos.forEach(detail => {
      const date = detail.date ? new Date(detail.date) : null;
      const title = date
        ? `${detail.key} (${date.getFullYear()}/${date.getMonth() + 1})`
        : detail.key;

      stockDetailsMessage.addField(title, detail.value, true);
    });

    const stockPages = Object.keys(STOCK.TIMES).map(time => {
      const page = new EmbedBuilder();

      page.setTitle(`${EMOJI.BAR_CHART} ${data.stockNameEng ?? data.indexNameEng}`);
      page.setImage(STOCK.WORLD_IMAGE(item.id, STOCK.TIMES[time], item.enumType === ItemType.WORLD_STOCK));
      page.setFooter({ text: time });

      return page;
    });

    const detailsSender = await ctx.sender.send(stockDetailsMessage);

    const menu = new Menu({ ctx, senderOverride: detailsSender });
    menu.setEmbedPages(stockPages);
    await menu.start();

    ctx.sender = detailsSender;
  }

  private async _showDomesticData(ctx: CommandContext, item: Item, data: StockData) {
    const stockDetailsMessage = new EmbedBuilder();

    stockDetailsMessage.setTitle(`${data.change >= 0 ? EMOJI.CHART_UP : EMOJI.CHART_DOWN} ${data.name}`);
    stockDetailsMessage.setColor(COLOR.BOT);
    stockDetailsMessage.setDescription(`${strong(data.price.toString())} (${data.change >= 0 ? EMOJI.UP_TRIANGLE : EMOJI.DOWN_TRIANGLE} ${data.change}, ${data.changePct > 0 ? `+${data.changePct}` : data.changePct}%)`);
    stockDetailsMessage.setThumbnail(STOCK.DOME_THUMB(item.id));
    stockDetailsMessage.setFooter({ text: `${item.type}(${item.id})` });
    stockDetailsMessage.setTimestamp(Date.now());

    data.details.forEach(detail => {
      stockDetailsMessage.addField(detail[0], detail[1], true);
    });

    const stockPages = Object.keys(STOCK.TIMES).map(time => {
      const page = new EmbedBuilder();

      page.setTitle(`${EMOJI.BAR_CHART} ${data.name}`);
      page.setImage(STOCK.DOME_IMAGE(item.id, STOCK.TIMES[time]));
      page.setFooter({ text: time });

      return page;
    });

    const detailsSender = await ctx.sender.send(stockDetailsMessage);
    const menu = new Menu({ ctx, senderOverride: detailsSender });
    menu.setEmbedPages(stockPages);
    await menu.start();
  }
}

export default Stock;
