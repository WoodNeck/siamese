import { COLOR } from "@siamese/color";
import { Command, CommandContext, Cooldown } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { EMOJI } from "@siamese/emoji";
import axios, { type AxiosResponse } from "axios";
import NodeCache from "node-cache";

import { EXCHANGE } from "./const";

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

class Exchange extends Command {
  public override define() {
    return {
      data: EXCHANGE,
      deferReply: true,
      preconditions: [
        new Cooldown(3)
      ]
    };
  }

  public override async execute({ sender, getParams }: CommandContext) {
    const [content] = getParams<typeof EXCHANGE.USAGE>();

    if (!content) {
      await sender.replyError(EXCHANGE.ERROR.EMPTY_CONTENT);
      return;
    }

    const result = /^(\d+(?:\.\d+)?)(\D+)$/.exec(content);

    if (!result) {
      await sender.replyError(EXCHANGE.ERROR.WRONG_FORM);
      return;
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
      await sender.replyError(EXCHANGE.ERROR.WRONG_FORM);
      return;
    }

    const data = currencyToDataMap.get(unit)!;
    const embed = new EmbedBuilder();
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

    await sender.send(embed);
  }
}

export default Exchange;
