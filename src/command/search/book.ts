import { MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import axios, { AxiosResponse } from "axios";
import { decode } from "html-entities";

import Siamese from "~/Siamese";
import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu from "~/core/Menu";
import * as ERROR from "~/const/error";
import * as EMOJI from "~/const/emoji";
import * as PERMISSION from "~/const/permission";
import { BOOK } from "~/const/command/search";
import { KAKAO_HEADER } from "~/const/header";

export default new Command({
  name: BOOK.CMD,
  description: BOOK.DESC,
  usage: BOOK.USAGE,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.ADD_REACTIONS,
    PERMISSION.READ_MESSAGE_HISTORY,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_USER(5),
  beforeRegister: (bot: Siamese) => bot.env.KAKAO_REST_KEY != null,
  slashData: new SlashCommandBuilder()
    .setName(BOOK.CMD)
    .setDescription(BOOK.DESC)
    .addStringOption(option => option
      .setName(BOOK.USAGE)
      .setDescription(BOOK.DESC_SLASH)
      .setRequired(true)
    ) as SlashCommandBuilder,
  execute: async ctx => {
    const { bot } = ctx;

    const content = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(BOOK.USAGE, true)
      : ctx.content;

    if (!content) {
      return bot.replyError(ctx, ERROR.SEARCH.EMPTY_CONTENT);
    }

    const { data } = await axios.get(BOOK.SEARCH_URL, {
      params: BOOK.SEARCH_PARAMS(content),
      headers: KAKAO_HEADER(bot)
    })as AxiosResponse<{
      meta: {
        is_end: boolean;
        pageable_count: number;
        total_count: number;
      };
      documents: Array<{
        authors: string[];
        contents: string;
        datetime: string;
        isbn: string;
        price: number;
        publisher: string;
        sale_price: number;
        status: string;
        thumbnail: string;
        title: string;
        translators: string[];
        url: string;
      }>;
    }>;

    const { documents } = data;

    if (documents.length <= 0) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_RESULT(BOOK.TARGET));
    }

    const pages = documents.map(doc => {
      const embed = new MessageEmbed();

      embed.setTitle(doc.title);
      embed.setThumbnail(doc.thumbnail);
      embed.setURL(doc.url);

      if (doc.contents) {
        embed.addField(BOOK.INFO_TITLE, `${decode(doc.contents)}...`);
      }

      const bookInfo: string[] = [doc.status];
      const author = `${BOOK.AUTHOR}: ${doc.authors.join(EMOJI.MIDDLE_DOT)}`;
      if (doc.translators.length > 0) {
        bookInfo.push(`${author} / ${BOOK.TRANSLATOR}: ${doc.translators.join(EMOJI.MIDDLE_DOT)}`);
      } else {
        bookInfo.push(author);
      }

      const date = new Date(doc.datetime).toLocaleDateString("ko-KR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }).split(" ").slice(0, 2).join(" ");
      bookInfo.push(`${BOOK.DATETIME}: ${date}`);
      bookInfo.push(`${BOOK.PUBLISHER}: ${doc.publisher}`);

      bookInfo.push(`${BOOK.PRICE}: ${doc.price}${BOOK.PRICE_UNIT} / ${BOOK.SALE_PRICE} : ${doc.sale_price}${BOOK.PRICE_UNIT}`);
      bookInfo.push(`ISBN: ${doc.isbn}`);

      embed.setDescription(bookInfo.join("\n"));

      return embed;
    });

    const menu = new Menu(ctx);
    menu.setPages(pages);

    await menu.start();
  }
});
