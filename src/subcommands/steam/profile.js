const axios = require('axios');
const { RichEmbed } = require('discord.js');
const dedent = require('@/utils/dedent');
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
		const userId = await axios.get(
			STEAM.SEARCH_BY_COMMUNITY_ID_URL,
			{ params: STEAM.SEARCH_BY_COMMUNITY_ID_PARAMS(searchText) }
		).then(body => body.data.response.success === 1
			? body.data.response.steamid
			: undefined
		);
		if (!userId) {
			msg.error(ERROR.STEAM.USER_NOT_FOUND);
			return;
		}

		// Get user profile datas
		const getUserSummary = axios.get(
			PROFILE.SUMMARY_URL,
			{ params: PROFILE.STEAM_IDS_PARAMS(userId) }
		).then(body => body.data.response.players[0]);
		const getUserBanState = axios.get(
			PROFILE.BAN_URL,
			{ params: PROFILE.STEAM_IDS_PARAMS(userId) }
		).then(body => body.data.players[0]);
		const getRecentlyPlayedGame = axios.get(
			PROFILE.RECENT_GAME_URL,
			{ params: PROFILE.RECENT_GAME_PARAMS(userId) }
		).then(body => body.data.response.games);
		const getUserLevel = axios.get(
			PROFILE.LEVEL_URL,
			{ params: PROFILE.STEAM_ID_PARAMS(userId) }
		).then(body => body.data.response.player_level);
		const getFriendList = axios.get(
			PROFILE.FRIEND_URL,
			{ params: PROFILE.FRIEND_PARAMS(userId) }
		).then(body => body.data.friendslist.friends);
		const getOwnedGames = axios.get(
			PROFILE.OWNED_GAME_URL,
			{ params: PROFILE.STEAM_ID_PARAMS(userId) }
		).then(body => body.data.response.game_count);


		const [summary, ban, games, level, friends, gamesCount] = await Promise.all([
			getUserSummary,
			getUserBanState,
			getRecentlyPlayedGame,
			getUserLevel,
			getFriendList,
			getOwnedGames,
		]);
		const profileColor = summary.gameextrainfo
			? COLOR.STEAM.PLAYING
			: summary.personastate
				? COLOR.STEAM.ONLINE
				: COLOR.STEAM.OFFLINE;
		const regionFlag = summary.loccountrycode ? `:flag_${summary.loccountrycode.toLowerCase()}: ` : '';
		const banStr = dedent`
			${ban.CommunityBanned ? EMOJI.GREEN_CHECK : EMOJI.CROSS} - ${PROFILE.BAN_COMMUNITY}
			${ban.VACBanned ? EMOJI.GREEN_CHECK : EMOJI.CROSS} - ${PROFILE.BAN_VAC}
			${ban.NumberOfGameBans > 0 ? EMOJI.GREEN_CHECK : EMOJI.CROSS} - ${PROFILE.BAN_GAME}
			${ban.EconomyBan !== 'none' ? EMOJI.GREEN_CHECK : EMOJI.CROSS} - ${PROFILE.BAN_ECONOMY}`;
		const profileDesc = dedent`
			${summary.gameextrainfo ? PROFILE.PLAYING_STATE(summary.gameextrainfo) : PROFILE.PERSONA_STATE[summary.personastate]}
			${summary.personastate === 0 ? PROFILE.LAST_LOGOFF(summary.lastlogoff * 1000) : ''}`;
		const userDetail = dedent`
			${level ? PROFILE.LEVEL(level) : ''}
			${friends && friends.length ? PROFILE.FRIENDS(friends) : ''}
			${gamesCount ? PROFILE.GAMES(gamesCount) : ''}`;

		const embed = new RichEmbed()
			.setTitle(PROFILE.TITLE(summary.personaname, regionFlag))
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
		if (games) {
			const recentGamesStr = games.reduce((prevStr, game) => {
				return `${prevStr}\n${PROFILE.GAME_DESC(game)}`;
			}, '');
			embed.addField(PROFILE.FIELD_RECENT_GAME, recentGamesStr);
		}
		channel.send(embed);
	},
};
