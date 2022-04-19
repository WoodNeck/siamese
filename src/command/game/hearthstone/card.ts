import { MessageEmbed } from "discord.js";
import axios, { AxiosResponse } from "axios";
import { SlashCommandSubcommandBuilder } from "@discordjs/builders";

import BattlenetAuthorization from "./BattlenetAuthorization";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu from "~/core/Menu";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import { HEARTHSTONE } from "~/const/command/game";

interface CardInfo {
  id: number;
  collectible: number;
  slug: string;
  classId: number;
  multiClassIds: number[];
  cardTypeId: number;
  cardSetId: number;
  rarityId: number;
  artistName: string;
  health: number;
  attack: number;
  manaCost: number;
  name: string;
  text: string;
  image: string;
  imageGold: string;
  flavorText: string;
  cropImage: string;
  keywordIds: number[];
  copyOfCardId: number;
}

export default new Command({
  name: HEARTHSTONE.CARD.CMD,
  description: HEARTHSTONE.CARD.DESC,
  usage: HEARTHSTONE.CARD.USAGE,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.READ_MESSAGE_HISTORY,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_USER(5),
  slashData: new SlashCommandSubcommandBuilder()
    .setName(HEARTHSTONE.CARD.CMD)
    .setDescription(HEARTHSTONE.CARD.DESC)
    .addStringOption(option => option
      .setName(HEARTHSTONE.CARD.USAGE)
      .setDescription(HEARTHSTONE.CARD.USAGE_DESC)
      .setRequired(true)
    ) as SlashCommandSubcommandBuilder,
  execute: async ctx => {
    const { bot } = ctx;

    const searchText = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(HEARTHSTONE.CARD.USAGE, true)
      : ctx.content;

    if (!searchText) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_CONTENT);
    }

    const token = await BattlenetAuthorization.getToken(bot);

    const { data } = await axios.get(HEARTHSTONE.CARD.ENDPOINT, {
      params: {
        ...HEARTHSTONE.CARD.DEFAULT_PARAMS,
        textFilter: searchText,
        access_token: token
      }
    }) as AxiosResponse<{ cards: CardInfo[]; cardCount: number; pageCount: number; page: number }>;

    const cards = data.cards.filter(card => card.cardTypeId !== 3);

    if (cards.length <= 0) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_RESULT(HEARTHSTONE.CARD.CMD));
    }

    const pages = cards.map(card => {
      const embed = new MessageEmbed();

      embed.setDescription(card.flavorText);
      embed.setImage(card.image);
      embed.setFooter({ text: card.name });

      const rarityColor = HEARTHSTONE.CARD.RARITY_COLOR[card.rarityId];
      if (rarityColor) {
        embed.setColor(rarityColor);
      }

      return embed;
    });

    const menu = new Menu(ctx);
    menu.setPages(pages);

    await menu.start();
  }
});
