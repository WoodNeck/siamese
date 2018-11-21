const axios = require('axios');
const { STEAM } = require('@/constants/commands/steam');


const getUserId = async id => {
	const searchByCommunityId = axios.get(
		STEAM.SEARCH_BY_COMMUNITY_ID_URL,
		{ params: STEAM.SEARCH_BY_COMMUNITY_ID_PARAMS(id) }
	).then(body => body.data.response.success === 1
		? body.data.response.steamid
		: undefined
	);

	// STEAM 64-bit ID could given as parameter
	const searchByIdItself = /^[0-9]*$/.test(id)
		? axios.get(
			STEAM.SUMMARY_URL,
			{ params: STEAM.STEAM_IDS_PARAMS(id) }
		).then(body => body.data.response.players[0])
			.catch(() => undefined)
		: new Promise(resolve => { resolve(); });

	const [userId, userDetail] = await Promise.all([searchByCommunityId, searchByIdItself]);
	// return userId if community id search matched
	// return parameter itself when it's correct 64-bit encoded steam id
	// else return undefined
	return userId
		? userId
		: userDetail
			? id
			: undefined;
};

const getUserSummary = async userId => await axios.get(
	STEAM.SUMMARY_URL,
	{ params: STEAM.STEAM_IDS_PARAMS(userId) }
).then(body => body.data.response.players[0])
	.catch(() => undefined);

const getUserBanState = async userId => await axios.get(
	STEAM.BAN_URL,
	{ params: STEAM.STEAM_IDS_PARAMS(userId) }
).then(body => body.data.players[0])
	.catch(() => undefined);

const getRecentlyPlayedGame = async userId => await axios.get(
	STEAM.RECENT_GAME_URL,
	{ params: STEAM.RECENT_GAME_PARAMS(userId) }
).then(body => body.data.response.games)
	.catch(() => undefined);

const getUserLevel = async userId => await axios.get(
	STEAM.LEVEL_URL,
	{ params: STEAM.STEAM_ID_PARAMS(userId) }
).then(body => body.data.response.player_level)
	.catch(() => undefined);

const getFriendList = async userId => await axios.get(
	STEAM.FRIEND_URL,
	{ params: STEAM.FRIEND_PARAMS(userId) }
).then(body => body.data.friendslist.friends)
	.catch(() => undefined);

const getOwnedGames = async (userId, isDetailed) => await axios.get(
	STEAM.OWNED_GAME_URL,
	{ params: STEAM.OWNED_GAME_PARAMS(userId, isDetailed) }
).then(body => body.data.response)
	.catch(() => undefined);

module.exports = {
	getUserId: getUserId,
	getUserSummary: getUserSummary,
	getUserBanState: getUserBanState,
	getRecentlyPlayedGame: getRecentlyPlayedGame,
	getUserLevel: getUserLevel,
	getFriendList: getFriendList,
	getOwnedGames: getOwnedGames,
};
