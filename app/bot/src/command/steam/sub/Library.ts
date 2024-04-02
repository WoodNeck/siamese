import { CommandContext, Cooldown, SubCommand } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { EMOJI } from "@siamese/emoji";
import { Menu } from "@siamese/menu";
import { getOwningGames, getUserID, getUserSummary } from "@siamese/steam";
import { range } from "@siamese/util";

import { LIBRARY, STEAM } from "../const";

class SteamLibrary extends SubCommand {
  public override define() {
    return {
      data: LIBRARY,
      deferReply: true,
      preconditions: [
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ ctx, sender, getParams }: CommandContext) {
    const [searchText] = getParams<typeof LIBRARY.USAGE>();

    if (!searchText) {
      await sender.replyError(STEAM.ERROR.EMPTY_USER_ID);
      return;
    }

    // Find out 64-bit encoded steamid
    const userID = await getUserID(searchText);

    if (!userID) {
      await sender.replyError(STEAM.ERROR.USER_NOT_FOUND);
      return;
    }

    // Get user summary
    const summary = await getUserSummary(userID);
    if (!summary) {
      await sender.replyError(STEAM.ERROR.USER_NOT_FOUND);
      return;
    }

    // Get games owning
    const owningGames = await getOwningGames(userID);
    if (!owningGames || !owningGames.length) {
      await sender.replyError(STEAM.ERROR.EMPTY_GAMES);
      return;
    }

    const pages: EmbedBuilder[] = [];
    const totalPages = Math.min(Math.floor((owningGames.length - 1) / LIBRARY.GAMES_PER_PAGE) + 1, LIBRARY.MAX_PAGES);
    for (const i of range(totalPages)) {
      const games = owningGames.slice(i * LIBRARY.GAMES_PER_PAGE, (i + 1) * LIBRARY.GAMES_PER_PAGE);
      const gameDescs: string[] = [];
      games.forEach(game => {
        gameDescs.push(`${EMOJI.VIDEO_GAME} ${game.name} - ${STEAM.PLAYTIME_SHORT(game.playtime_forever)}`);
      });
      pages.push(new EmbedBuilder({
        title: summary.personaname,
        description: gameDescs.join("\n"),
        url: STEAM.PROFILE_GAME_URL(summary.profileurl),
        thumbnail: summary.avatarmedium
      }));
    }

    const menu = new Menu({ ctx });
    menu.setEmbedPages(pages);

    await menu.start();
  }
}

export default SteamLibrary;
