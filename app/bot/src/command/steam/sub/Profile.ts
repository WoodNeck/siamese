import { COLOR } from "@siamese/color";
import { CommandContext, Cooldown, SubCommand } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { EMOJI } from "@siamese/emoji";
import { getFriendList, getOwningGames, getRecentlyPlayedGame, getUserBanState, getUserID, getUserLevel, getUserSummary } from "@siamese/steam";
import { stripIndents } from "common-tags";

import { PROFILE, STEAM } from "../const";

class SteamProfile extends SubCommand {
  public override define() {
    return {
      data: PROFILE,
      deferReply: true,
      preconditions: [
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ sender, getParams }: CommandContext) {
    const [searchText] = getParams<typeof PROFILE.USAGE>();

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

    // Get user profile datas
    // Catch error, and return undefined as some of these can return 401 unauthorized
    const [summary, ban, recentGames, level, friends, owningGames] = await Promise.all([
      getUserSummary(userID),
      getUserBanState(userID),
      getRecentlyPlayedGame(userID),
      getUserLevel(userID),
      getFriendList(userID),
      getOwningGames(userID)
    ]);

    if (!summary || !ban) {
      await sender.replyError(STEAM.ERROR.USER_NOT_FOUND);
      return;
    }

    const profileColor = summary.gameextrainfo
      ? COLOR.STEAM.PLAYING
      : summary.personastate
        ? COLOR.STEAM.ONLINE
        : COLOR.STEAM.OFFLINE;
    const regionFlag = summary.loccountrycode ? `:flag_${summary.loccountrycode.toLowerCase()}: ` : null;
    const banStr = stripIndents`
			${ban.CommunityBanned ? EMOJI.OK : EMOJI.CROSS} - ${PROFILE.BAN_COMMUNITY}
			${ban.VACBanned ? EMOJI.OK : EMOJI.CROSS} - ${PROFILE.BAN_VAC}
			${ban.NumberOfGameBans > 0 ? EMOJI.OK : EMOJI.CROSS} - ${PROFILE.BAN_GAME}
			${ban.EconomyBan !== "none" ? EMOJI.OK : EMOJI.CROSS} - ${PROFILE.BAN_ECONOMY}`;
    const profileDesc = `${summary.gameextrainfo ? PROFILE.PLAYING_STATE(summary.gameextrainfo) : PROFILE.PERSONA_STATE[summary.personastate]}`;
    const userDetail = stripIndents`
			${regionFlag ? regionFlag : ""}
			${level ? PROFILE.LEVEL(level) : ""}
			${friends && friends.length ? PROFILE.FRIENDS(friends) : ""}
			${owningGames && owningGames.length ? PROFILE.GAMES(owningGames.length) : ""}`;

    const embed = new EmbedBuilder({
      title: summary.personaname,
      description: profileDesc,
      url: summary.profileurl,
      thumbnail: summary.avatarmedium,
      color: profileColor
    });

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

    await sender.send(embed);
  }
}

export default SteamProfile;
