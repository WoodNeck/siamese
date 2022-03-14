/* eslint-disable @typescript-eslint/naming-convention */
import { MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import axios from "axios";
import NodeCache from "node-cache";
import * as Hangul from "hangul-js";
import Fuse from "fuse.js";

import Siamese from "~/Siamese";
import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu from "~/core/Menu";
import * as ERROR from "~/const/error";
import * as EMOJI from "~/const/emoji";
import * as PERMISSION from "~/const/permission";
import { COIN } from "~/const/command/search";
import { strong } from "~/util/markdown";

// Store market coins data for 1 hour
const coinCache = new NodeCache({ stdTTL: 60 * 60, useClones: false });

export default new Command({
  name: COIN.CMD,
  description: COIN.DESC,
  usage: COIN.USAGE,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.ADD_REACTIONS,
    PERMISSION.READ_MESSAGE_HISTORY,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_USER(5),
  beforeRegister: (bot: Siamese) => bot.env.COIN_API_KEY != null,
  slashData: new SlashCommandBuilder()
    .setName(COIN.CMD)
    .setDescription(COIN.DESC)
    .addStringOption(option => option
      .setName(COIN.USAGE)
      .setDescription(COIN.DESC_OPTION)
      .setRequired(true)
    ) as SlashCommandBuilder,
  execute: async ctx => {
    const { bot } = ctx;

    const content = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(COIN.USAGE, true)
      : ctx.content;

    if (!content) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_CONTENT);
    }

    if (!coinCache.has(COIN.MARKET_KEY)) {
      const [coinData, chartData] = await Promise.all([
        axios.get(COIN.MARKET_URL).then(res => res.data),
        axios.get(COIN.CHART_ID_URL, {
          headers: {
            "X-CMC_PRO_API_KEY": bot.env.COIN_API_KEY
          }
        }).then(res => res.data.data)
      ]);

      const symbolToIDMap = new Map();
      chartData.forEach(item => {
        symbolToIDMap.set(item.symbol, item.id);
      });

      coinCache.set(COIN.MARKET_KEY, coinData.map(data => ({
        ...data,
        id: symbolToIDMap.get(data.market.split("-")[1]),
        disassembled: Hangul.disassembleToString(data.korean_name)
      })));
    }

    const marketData = coinCache.get(COIN.MARKET_KEY) as any[];

    const fuse = new Fuse(marketData, {
      threshold: 0.3,
      keys: ["disassembled", "english_name"]
    });
    const result = fuse.search(Hangul.disassembleToString(content));

    if (result.length <= 0) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_RESULT(COIN.TARGET));
    }

    result.sort((a, b) => {
      const idA = a.item.market;
      const idB = b.item.market;

      return getCoinPriority(idA) - getCoinPriority(idB);
    });

    const coinInfos = await axios.get(COIN.TICKER_URL, {
      params: {
        markets: result.map(res => res.item.market).join(",")
      }
    }).then(res => res.data);

    const coinPages = coinInfos.map((coinInfo, idx) => {
      const coin = result[idx].item;
      const embed = new MessageEmbed();
      const currency = coin.market.split("-")[0];

      embed.setAuthor({ name: coin.korean_name, iconURL: COIN.COIN_IMAGE_URL(coin.id) });
      embed.setDescription(`${strong(coinInfo.trade_price.toString())} ${currency} (${coinInfo.signed_change_price >= 0 ? EMOJI.UP_TRIANGLE : EMOJI.DOWN_TRIANGLE} ${coinInfo.signed_change_price > 0 ? "+" : ""}${coinInfo.signed_change_price}, ${coinInfo.signed_change_rate > 0 ? "+" : ""}${coinInfo.signed_change_rate.toFixed(3)}%)`);
      embed.setImage(COIN.CHART_IMAGE_URL(coin.id));

      embed.addField(COIN.NAME.HIGH_PRICE, coinInfo.high_price.toString(), true);
      embed.addField(COIN.NAME.LOW_PRICE, coinInfo.low_price.toString(), true);
      embed.addField(COIN.NAME.TRADE_VOLUME_24H, coinInfo.acc_trade_volume_24h.toString(), true);
      embed.addField(COIN.NAME.TRADE_PRICE_24H, coinInfo.acc_trade_price_24h.toString(), true);
      embed.addField(COIN.NAME.HIGHEST_52_WEEK_PRICE, `${coinInfo.highest_52_week_price} (${coinInfo.highest_52_week_date})`, true);
      embed.addField(COIN.NAME.LOWEST_52_WEEK_PRICE, `${coinInfo.lowest_52_week_price} (${coinInfo.lowest_52_week_date})`, true);

      embed.setFooter({ text: coin.market });
      embed.setTimestamp(coinInfo.timestamp);

      return embed;
    });

    const menu = new Menu(ctx);
    menu.setPages(coinPages);
    await menu.start();
  }
});

const getCoinPriority = (id: string) => {
  if (id.startsWith("KRW")) return 0;
  if (id.startsWith("USDT")) return 1;
  return 2;
};

