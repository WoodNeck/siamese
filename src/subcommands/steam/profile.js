const { RichEmbed } = require('discord.js');
const dedent = require('@/utils/dedent');
const Steam = require('@/helper/steam');
const COLOR = require('@/constants/color');
const EMOJI = require('@/constants/emoji');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { STEAM, PROFILE } = require('@/constants/commands/steam');


module.exports = {
	name: PROFILE.CMD,
	description: PROFILE.DESC,
	usage: PROFILE.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
	],
	execute: async ({ msg, channel, content }) => {
		if (!content) {
			msg.error(ERROR.SEARCH.EMPTY_CONTENT);
			return;
		}
		await channel.startTyping();

		// Find out 64-bit encoded steamid
		const searchText = content;
		const userId = await Steam.getUserId(searchText);

		if (!userId) {
			msg.error(ERROR.STEAM.USER_NOT_FOUND);
			return;
		}

		// Get user profile datas
		// Catch error, and return undefined as some of these can return 401 unauthorized
		const [summary, ban, recentGames, level, friends, owningGames] = await Promise.all([
			Steam.getUserSummary(userId),
			Steam.getUserBanState(userId),
			Steam.getRecentlyPlayedGame(userId),
			Steam.getUserLevel(userId),
			Steam.getFriendList(userId),
			Steam.getOwningGames(userId),
		]);

		if (!summary) {
			msg.error(ERROR.STEAM.USER_NOT_FOUND);
			return;
		}

		const profileColor = summary.gameextrainfo
			? COLOR.STEAM.PLAYING
			: summary.personastate
				? COLOR.STEAM.ONLINE
				: COLOR.STEAM.OFFLINE;
		const regionFlag = summary.loccountrycode ? `:flag_${summary.loccountrycode.toLowerCase()}: ` : undefined;
		const banStr = dedent`
			${ban.CommunityBanned ? EMOJI.LARGE_CIRCLE : EMOJI.CROSS} - ${PROFILE.BAN_COMMUNITY}
			${ban.VACBanned ? EMOJI.LARGE_CIRCLE : EMOJI.CROSS} - ${PROFILE.BAN_VAC}
			${ban.NumberOfGameBans > 0 ? EMOJI.LARGE_CIRCLE : EMOJI.CROSS} - ${PROFILE.BAN_GAME}
			${ban.EconomyBan !== 'none' ? EMOJI.LARGE_CIRCLE : EMOJI.CROSS} - ${PROFILE.BAN_ECONOMY}`;
		const profileDesc = dedent`
			${summary.gameextrainfo ? PROFILE.PLAYING_STATE(summary.gameextrainfo) : PROFILE.PERSONA_STATE[summary.personastate]}
			${summary.personastate === 0 ? PROFILE.LAST_LOGOFF(summary.lastlogoff * 1000) : ''}`;
		const userDetail = dedent`
			${regionFlag ? regionFlag : ''}
			${level ? PROFILE.LEVEL(level) : ''}
			${friends && friends.length ? PROFILE.FRIENDS(friends) : ''}
			${owningGames && owningGames.game_count ? PROFILE.GAMES(owningGames.game_count) : ''}`;

		const embed = new RichEmbed()
			.setTitle(summary.personaname)
			.setDescription(profileDesc)
			.setURL(summary.profileurl)
			.setThumbnail(summary.avatarmedium)
			.setColor(profileColor);
		if (summary.timecreated) {
			embed.setFooter(PROFILE.REGISTERED(summary.timecreated * 1000), STEAM.ICON_URL);
		}
		if (userDetail.length) {
			embed.addField(PROFILE.FIELD_DETAIL, userDetail, true);
		}
		embed.addField(PROFILE.FIELD_BAN, banStr, true);
		if (recentGames) {
			const recentGamesStr = recentGames.reduce((prevStr, game) => {
				return `${prevStr}\n${PROFILE.GAME_DESC(game)}`;
			}, '');
			embed.addField(PROFILE.FIELD_RECENT_GAME, recentGamesStr);
		}
		channel.send(embed);
	},
};
