import { MessageEmbed } from "discord.js";
import { SlashCommandSubcommandBuilder } from "@discordjs/builders";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import { getUserId, getUserBanState, getRecentlyPlayedGame, getUserLevel, getUserSummary, getOwningGames, getFriendList } from "~/command/steam/api";
import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import { STEAM, PROFILE } from "~/const/command/steam";
import { dedent } from "~/util/helper";

export default new Command({
  name: PROFILE.CMD,
  description: PROFILE.DESC,
  usage: PROFILE.USAGE,
  permissions: [
    PERMISSION.EMBED_LINKS
  ],
  cooldown: Cooldown.PER_USER(5),
  slashData: new SlashCommandSubcommandBuilder()
    .setName(PROFILE.CMD)
    .setDescription(PROFILE.DESC)
    .addStringOption(option => option
      .setName(PROFILE.USAGE)
      .setDescription(STEAM.COMMUNITY_ID_DESC)
      .setRequired(true)
    ) as SlashCommandSubcommandBuilder,
  execute: async ctx => {
    const { bot } = ctx;
    const content = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(PROFILE.USAGE, true)
      : ctx.content;

    if (!content) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_CONTENT);
    }

    // Find out 64-bit encoded steamid
    const searchText = content;
    const userId = await getUserId(bot, searchText);

    if (!userId) {
      return await bot.replyError(ctx, STEAM.ERROR.USER_NOT_FOUND);
    }

    // Get user profile datas
    // Catch error, and return undefined as some of these can return 401 unauthorized
    const [summary, ban, recentGames, level, friends, owningGames] = await Promise.all([
      getUserSummary(bot, userId),
      getUserBanState(bot, userId),
      getRecentlyPlayedGame(bot, userId),
      getUserLevel(bot, userId),
      getFriendList(bot, userId),
      getOwningGames(bot, userId)
    ]);

    if (!summary || !ban) {
      return await bot.replyError(ctx, STEAM.ERROR.USER_NOT_FOUND);
    }

    const profileColor = summary.gameextrainfo
      ? COLOR.STEAM.PLAYING
      : summary.personastate
        ? COLOR.STEAM.ONLINE
        : COLOR.STEAM.OFFLINE;
    const regionFlag = summary.loccountrycode ? `:flag_${summary.loccountrycode.toLowerCase()}: ` : null;
    const banStr = dedent`
			${ban.CommunityBanned ? EMOJI.OK : EMOJI.CROSS} - ${PROFILE.BAN_COMMUNITY}
			${ban.VACBanned ? EMOJI.OK : EMOJI.CROSS} - ${PROFILE.BAN_VAC}
			${ban.NumberOfGameBans > 0 ? EMOJI.OK : EMOJI.CROSS} - ${PROFILE.BAN_GAME}
			${ban.EconomyBan !== "none" ? EMOJI.OK : EMOJI.CROSS} - ${PROFILE.BAN_ECONOMY}`;
    const profileDesc = `${summary.gameextrainfo ? PROFILE.PLAYING_STATE(summary.gameextrainfo) : PROFILE.PERSONA_STATE[summary.personastate]}`;
    const userDetail = dedent`
			${regionFlag ? regionFlag : ""}
			${level ? PROFILE.LEVEL(level) : ""}
			${friends && friends.length ? PROFILE.FRIENDS(friends) : ""}
			${owningGames && owningGames.length ? PROFILE.GAMES(owningGames.length) : ""}`;

    const embed = new MessageEmbed()
      .setTitle(summary.personaname)
      .setDescription(profileDesc)
      .setURL(summary.profileurl)
      .setThumbnail(summary.avatarmedium)
      .setColor(profileColor);
    if (summary.timecreated) {
      embed.setFooter({
        text: PROFILE.REGISTERED(summary.timecreated * 1000),
        iconURL: STEAM.ICON_URL
      });
    }
    if (userDetail.length) {
      embed.addField(PROFILE.FIELD_DETAIL, userDetail, true);
    }
    embed.addField(PROFILE.FIELD_BAN, banStr, true);
    if (recentGames) {
      const recentGamesStr = recentGames.reduce((prevStr, game) => `${prevStr}\n${PROFILE.GAME_DESC(game)}`, "");
      embed.addField(PROFILE.FIELD_RECENT_GAME, recentGamesStr);
    }

    await bot.send(ctx, { embeds: [embed] });
  }
});
