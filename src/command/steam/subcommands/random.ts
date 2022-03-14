import { MessageEmbed } from "discord.js";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import { getUserId, getOwningGames } from "~/command/steam/api";
import * as COLOR from "~/const/color";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import { STEAM, RANDOM } from "~/const/command/steam";
import { getRandom } from "~/util/helper";


export default new Command({
  name: RANDOM.CMD,
  description: RANDOM.DESC,
  usage: RANDOM.USAGE,
  permissions: [
    PERMISSION.EMBED_LINKS
  ],
  cooldown: Cooldown.PER_USER(5),
  execute: async ctx => {
    const { bot } = ctx;

    const content = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(RANDOM.USAGE, true)
      : ctx.content;

    if (!content) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_CONTENT);
    }

    const searchText = content;
    const userId = await getUserId(bot, searchText);
    if (!userId) {
      return await bot.replyError(ctx, STEAM.ERROR.USER_NOT_FOUND);
    }

    const owningGames = await getOwningGames(bot, userId);
    if (!owningGames || owningGames.length <= 0) {
      return await bot.replyError(ctx, STEAM.ERROR.EMPTY_GAMES);
    }

    const randomGame = getRandom(owningGames);
    const embed = new MessageEmbed()
      .setAuthor({ name: randomGame.name, iconURL: STEAM.GAME_IMG_URL(randomGame.appid, randomGame.img_icon_url) })
      .setThumbnail(STEAM.GAME_IMG_URL(randomGame.appid, randomGame.img_logo_url))
      .setDescription(STEAM.PLAYTIME(randomGame.playtime_forever))
      .setColor(COLOR.BOT);

    await bot.send(ctx, { embeds: [embed] });
  }
});
