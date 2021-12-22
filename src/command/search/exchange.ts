import { MessageEmbed } from "discord.js";
import axios, { AxiosResponse } from "axios";
import NodeCache from "node-cache";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import * as ERROR from "~/const/error";
import * as EMOJI from "~/const/emoji";
import * as COLOR from "~/const/color";
import * as PERMISSION from "~/const/permission";
import { EXCHANGE } from "~/const/command/search";

interface ExchangeAPIData {
  basePrice: number;
  change: string;
  changePrice: number;
  changeRate: number;
  chartImageUrl: {
    day: string;
    month: string;
    month3: string;
    year: string;
  };
  country: string;
  currencyCode: string;
  currencyName: string;
  currencyUnit: number;
  date: string;
  name: string;
}

// Store exchange rate data for 1 hour
const exchangeCache = new NodeCache({ stdTTL: 60 * 60, useClones: false });

export default new Command({
  name: EXCHANGE.CMD,
  description: EXCHANGE.DESC,
  usage: EXCHANGE.USAGE,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.ADD_REACTIONS,
    PERMISSION.READ_MESSAGE_HISTORY,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_USER(3),
  execute: async ctx => {
    if (ctx.isSlashCommand()) return;

    const { bot, content } = ctx;

    if (!content) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_CONTENT);
    }

    const result = /^(\d+)(\D+)$/.exec(content);

    if (!result) {
      return await bot.replyError(ctx, EXCHANGE.ERROR.WRONG_FORM);
    }

    const amount = parseFloat(result[1]) as number;
    const unit = result[2].trim() as string;

    if (!exchangeCache.has(EXCHANGE.CACHE_KEY)) {
      const { data: exchangeInfo } = await axios.get(EXCHANGE.API_URL) as AxiosResponse<ExchangeAPIData[]>;

      const currencyToDataMap = new Map();
      exchangeInfo.forEach(item => {
        if (!currencyToDataMap.has(item.currencyName)) {
          currencyToDataMap.set(item.currencyName, item);
        }
        currencyToDataMap.set(`${item.country} ${item.currencyName}`, item);
        currencyToDataMap.set(item.currencyCode, item);
      });

      exchangeCache.set(EXCHANGE.CACHE_KEY, currencyToDataMap);
    }

    const currencyToDataMap = exchangeCache.get(EXCHANGE.CACHE_KEY) as Map<string, ExchangeAPIData>;

    if (!currencyToDataMap.has(unit)) {
      return await bot.replyError(ctx, EXCHANGE.ERROR.WRONG_FORM);
    }

    const data = currencyToDataMap.get(unit)!;
    const embed = new MessageEmbed();
    const isRise = data.change === EXCHANGE.CHANGE.RISE;
    const changeEmoji = isRise
      ? EMOJI.UP_TRIANGLE
      : EMOJI.DOWN_TRIANGLE;

    const exchangedAmount = parseFloat((amount * data.basePrice / data.currencyUnit).toFixed(2));
    const changeSign = isRise ? 1 : -1;
    const changeAmount = changeSign * data.changePrice;
    const changeRate = parseFloat((changeSign * data.changeRate * 100).toFixed(3));

    embed.setTitle(`${EMOJI.DOLLAR} ${exchangedAmount}${EXCHANGE.DEFAULT_UNIT}`);
    embed.setDescription(`${data.currencyUnit} ${data.country} ${data.currencyName}(${data.currencyCode}) = ${data.basePrice}${EXCHANGE.DEFAULT_UNIT} (${changeEmoji}${changeAmount}, ${changeRate}%)`);
    embed.setColor(COLOR.BOT);
    embed.setTimestamp(new Date(data.date));

    await bot.send(ctx, { embeds: [embed] });
  }
});
