import { Command, CommandContext, Cooldown } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { EMOJI } from "@siamese/emoji";
import { searchBooks } from "@siamese/kakao";
import { Menu } from "@siamese/menu";

import { BOOK } from "./const";

class Book extends Command {
  public override define() {
    return {
      data: BOOK,
      deferReply: true,
      preconditions: [
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ sender, ctx, getParams }: CommandContext) {
    const [searchText] = getParams<typeof BOOK.USAGE>();

    if (!searchText) {
      await sender.replyError(BOOK.EMPTY_CONTENT);
      return;
    }

    const books = await searchBooks(searchText);

    if (books.length <= 0) {
      await sender.replyError(BOOK.EMPTY_RESULT);
      return;
    }

    const pages = books.map(book => {
      const embed = new EmbedBuilder();

      embed.setTitle(book.title);
      embed.setThumbnail(book.thumbnail);
      embed.setURL(book.url);

      if (book.contents) {
        embed.addField(BOOK.INFO_TITLE, `${book.contents}...`);
      }

      const bookInfo: string[] = [book.status];
      const author = `${BOOK.AUTHOR}: ${book.authors.join(EMOJI.MIDDLE_DOT)}`;
      if (book.translators.length > 0) {
        bookInfo.push(`${author} / ${BOOK.TRANSLATOR}: ${book.translators.join(EMOJI.MIDDLE_DOT)}`);
      } else {
        bookInfo.push(author);
      }

      const date = new Date(book.datetime).toLocaleDateString("ko-KR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }).split(" ").slice(0, 2).join(" ");
      bookInfo.push(`${BOOK.DATETIME}: ${date}`);
      bookInfo.push(`${BOOK.PUBLISHER}: ${book.publisher}`);

      bookInfo.push(`${BOOK.PRICE}: ${book.price}${BOOK.PRICE_UNIT} / ${BOOK.SALE_PRICE} : ${book.sale_price}${BOOK.PRICE_UNIT}`);
      bookInfo.push(`ISBN: ${book.isbn}`);

      embed.setDescription(bookInfo.join("\n"));

      return embed;
    });

    const menu = new Menu({ ctx });
    menu.setEmbedPages(pages);

    await menu.start();
  }
}

export default Book;
