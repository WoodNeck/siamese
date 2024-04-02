import { AutocompleteContext, Command, CommandContext, Cooldown } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { EMOJI } from "@siamese/emoji";
import { env } from "@siamese/env";
import { FuzzyMatcher } from "@siamese/fuzzy";
import { strong } from "@siamese/markdown";
import { Menu } from "@siamese/menu";
import axios from "axios";
import NodeCache from "node-cache";

import { COIN } from "./const";

// Store market coins data for 1 hour
const coinCache = new NodeCache({ stdTTL: 60 * 60, useClones: false });

interface CoinAPIResult {
  id: number;
  market: string;
  korean_name: string;
  english_name: string;
}

interface ChartAPIResult {
  id: number;
  rank: number;
  name: string;
  symbol: string;
  slug: string;
  is_active: number;
  first_historical_data: string;
  last_historical_data: string;
  platform: {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    token_address: string;
  } | null
}

interface CoinInfoAPIResult {
  market: string,
  trade_date: string,
  trade_time: string,
  trade_date_kst: string,
  trade_time_kst: string,
  trade_timestamp: number,
  opening_price: number,
  high_price: number,
  low_price: number,
  trade_price: number,
  prev_closing_price: number,
  change: string,
  change_price: number,
  change_rate: number,
  signed_change_price: number,
  signed_change_rate: number,
  trade_volume: number,
  acc_trade_price: number,
  acc_trade_price_24h: number,
  acc_trade_volume: number,
  acc_trade_volume_24h: number,
  highest_52_week_price: number,
  highest_52_week_date: string,
  lowest_52_week_price: number,
  lowest_52_week_date: string,
  timestamp: number,
}

class Coin extends Command {
  private _fetching: boolean = false;

  public override define() {
    return {
      data: COIN,
      deferReply: true,
      preconditions: [
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ sender, ctx, getParams }: CommandContext) {
    const [searchText] = getParams<typeof COIN.USAGE>();

    if (!searchText) {
      await sender.replyError(COIN.EMPTY_CONTENT);
      return;
    }

    const coins = await this._searchCoins(searchText);

    if (coins.length <= 0) {
      await sender.replyError(COIN.EMPTY_RESULT);
      return;
    }

    coins.sort((a, b) => {
      const idA = a.market;
      const idB = b.market;

      return this._getCoinPriority(idA) - this._getCoinPriority(idB);
    });

    const coinInfos = await axios.get(COIN.TICKER_URL, {
      params: {
        markets: coins.map(res => res.market).join(",")
      }
    }).then(res => res.data) as CoinInfoAPIResult[];

    const coinPages = coinInfos.map((coinInfo, idx) => {
      const coin = coins[idx];
      const embed = new EmbedBuilder();
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

    const menu = new Menu({ ctx });
    menu.setEmbedPages(coinPages);
    await menu.start();
  }

  public async autocomplete({ content, respond }: AutocompleteContext): Promise<void> {
    if (this._fetching) {
      await respond([]);
      return;
    }

    // 동일한 이름 묶기
    const found = Array.from(new Set(
      (await this._searchCoins(content))
        .map(({ korean_name: name }) => name)
    ));

    await respond(found.map(name => ({ name, value: name })));
  }

  private async _searchCoins(searchText: string) {
    if (!coinCache.has(COIN.MARKET_KEY)) {
      this._fetching = true;

      const [coinData, chartData] = await Promise.all([
        axios.get(COIN.MARKET_URL).then(res => res.data),
        axios.get(COIN.CHART_ID_URL, {
          headers: {
            "X-CMC_PRO_API_KEY": env.COIN_API_KEY
          }
        }).then(res => res.data.data)
      ]) as [CoinAPIResult[], ChartAPIResult[]];

      const symbolToIDMap = new Map<string, number>();
      chartData.forEach(item => {
        symbolToIDMap.set(item.symbol, item.id);
      });

      coinCache.set(COIN.MARKET_KEY, coinData.map(data => ({
        ...data,
        id: symbolToIDMap.get(data.market.split("-")[1])
      })));

      this._fetching = false;
    }

    const marketData = coinCache.get<CoinAPIResult[]>(COIN.MARKET_KEY)!;
    const matcher = new FuzzyMatcher();

    return [
      ...matcher.searchWithKey(searchText, marketData, "korean_name"),
      ...matcher.enSearchWithKey(searchText, marketData, "english_name")
    ];
  }

  private _getCoinPriority(id: string) {
    if (id.startsWith("KRW")) return 0;
    if (id.startsWith("USDT")) return 1;
    return 2;
  }
}

export default Coin;
