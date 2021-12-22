import { MessageEmbed } from "discord.js";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu from "~/core/Menu";
import { getUserId, getUserSummary, getOwningGames } from "~/command/steam/api";
import * as EMOJI from "~/const/emoji";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import { STEAM, LIBRARY } from "~/const/command/steam";

export default new Command({
  name: LIBRARY.CMD,
  description: LIBRARY.DESC,
  usage: LIBRARY.USAGE,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.ADD_REACTIONS,
    PERMISSION.READ_MESSAGE_HISTORY,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_USER(5),
  execute: async ctx => {
    if (ctx.isSlashCommand()) return;

    const { bot, content } = ctx;

    if (!content) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_CONTENT);
    }

    // Find out 64-bit encoded steamid
    const userId = await getUserId(bot, content);
    if (!userId) {
      return await bot.replyError(ctx, STEAM.ERROR.USER_NOT_FOUND);
    }

    // Get user summary
    const summary = await getUserSummary(bot, userId);
    if (!summary) {
      return await bot.replyError(ctx, STEAM.ERROR.USER_NOT_FOUND);
    }

    // Get games owning
    const owningGames = await getOwningGames(bot, userId);
    if (!owningGames || !owningGames.length) {
      return await bot.replyError(ctx, STEAM.ERROR.EMPTY_GAMES);
    }

    const pages: MessageEmbed[] = [];
    const totalPages = Math.min(Math.floor((owningGames.length - 1) / LIBRARY.GAMES_PER_PAGE) + 1, LIBRARY.MAX_PAGES);
    for (const i of [...Array(totalPages).keys()]) {
      const games = owningGames.slice(i * LIBRARY.GAMES_PER_PAGE, (i + 1) * LIBRARY.GAMES_PER_PAGE);
      const gameDescs: string[] = [];
      games.forEach(game => {
        gameDescs.push(`${EMOJI.VIDEO_GAME} ${game.name} - ${STEAM.PLAYTIME_SHORT(game.playtime_forever)}`);
      });
      pages.push(new MessageEmbed()
        .setTitle(summary.personaname)
        .setURL(STEAM.PROFILE_GAME_URL(summary.profileurl))
        .setThumbnail(summary.avatarmedium)
        .setDescription(gameDescs.join("\n"))
      );
    }

    const menu = new Menu(ctx, { maxWaitTime: LIBRARY.RECITAL_TIME });
    menu.setPages(pages);

    await menu.start();
  }
});
