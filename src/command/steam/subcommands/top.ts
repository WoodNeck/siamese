import { MessageEmbed } from "discord.js";
import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import axios from "axios";
import cheerio from "cheerio";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu from "~/core/Menu";
import * as PERMISSION from "~/const/permission";
import { STEAM, TOP } from "~/const/command/steam";

export default new Command({
  name: TOP.CMD,
  description: TOP.DESC,
  permissions: [
    PERMISSION.EMBED_LINKS
  ],
  cooldown: Cooldown.PER_USER(5),
  slashData: new SlashCommandSubcommandBuilder()
    .setName(TOP.CMD)
    .setDescription(TOP.DESC),
  execute: async ctx => {
    const topGamesPage = await axios.get(TOP.SEARCH_URL).then(body => body.data as string);

    const $ = cheerio.load(topGamesPage);
    const rows = $("#detailStats").find(".player_count_row");
    const games: string[][] = [];
    rows.each((idx, el) => {
      games.push([...el.children.map(child => $(child).text().trim())].filter(text => text));
    });

    const perPage = TOP.GAMES_PER_PAGE;
    const maxPage = games.length / perPage;
    const pages: MessageEmbed[] = [];

    for (let pageNum = 0; pageNum < maxPage; pageNum++) {
      const gamesSliced = games.slice(perPage * pageNum, perPage * (pageNum + 1));
      const page = new MessageEmbed();

      gamesSliced.forEach((game, index) => page.addField(
        TOP.GAME_TITLE(perPage * pageNum + index + 1, game),
        TOP.GAME_STATISTICS(game),
      ));
      page.setFooter(`${TOP.FORMAT_INFO}`, STEAM.ICON_URL);

      pages.push(page);
    }

    const menu = new Menu(ctx);
    menu.setPages(pages);

    await menu.start();
  }
});
