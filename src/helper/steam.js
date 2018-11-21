const axios = require('axios');
const Fuse = require('fuse.js');
const NodeCache = require('node-cache');
const CACHE = require('@/constants/cache');
const { STEAM } = require('@/constants/commands/steam');

const caches = {
	userId: new NodeCache({
		stdTTL: CACHE.STEAM.USER_ID.ttl,
		checkperiod: CACHE.STEAM.USER_ID.checkPeriod,
	}),
	owningGames: new NodeCache({
		stdTTL: CACHE.STEAM.OWNING_GAMES.ttl,
		checkperiod: CACHE.STEAM.OWNING_GAMES.checkPeriod,
	}),
};

const getUserId = async searchText => {
	const cachedUserId = caches.userId.get(searchText);
	if (cachedUserId) {
		return cachedUserId;
	}
	else {
		const searchByCommunityId = axios.get(
			STEAM.SEARCH_BY_COMMUNITY_ID_URL,
			{ params: STEAM.SEARCH_BY_COMMUNITY_ID_PARAMS(searchText) }
		).then(body => body.data.response.success === 1
			? body.data.response.steamid
			: undefined
		);

		// STEAM 64-bit ID could given as parameter
		const searchByIdItself = /^[0-9]*$/.test(searchText)
			? axios.get(
				STEAM.SUMMARY_URL,
				{ params: STEAM.STEAM_IDS_PARAMS(searchText) }
			).then(body => body.data.response.players[0])
				.catch(() => undefined)
			: new Promise(resolve => { resolve(); });

		// return userId if community id search matched
		// return parameter itself when it's correct 64-bit encoded steam id
		// else return undefined
		const [userId, userDetail] = await Promise.all([searchByCommunityId, searchByIdItself]);
		if (userId) {
			caches.userId.set(searchText, userId);
			return userId;
		}
		else if (userDetail) {
			caches.userId.set(searchText, searchText);
			return searchText;
		}
		return undefined;
	}
};

const getGame = async searchText => {
	return await axios.get(
		STEAM.SEARCH_BY_GAME_NAME_URL,
		{ params: STEAM.SEARCH_BY_GAME_NAME_PARAMS(searchText) }
	).then(body => {
		if (body.data && body.data.total) {
			const games = body.data.items;
			// Find correct game by doing fuzzy matching
			const game = new Fuse(games, {
				shouldSort: true,
				threshold: 1,
				keys: ['name'],
			}).search(searchText)[0];
			return game;
		}
		else {
			return undefined;
		}
	}).catch(() => undefined);
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

const getOwningGames = async (userId, isDetailed) => {
	const cachedGames = caches.owningGames.get(userId);
	if (cachedGames) {
		return cachedGames;
	}
	else {
		return await axios.get(
			STEAM.OWNING_GAME_URL,
			{ params: STEAM.OWNING_GAME_PARAMS(userId, isDetailed) }
		).then(body => {
			if (body.data.response) {
				const owningGames = body.data.response;
				// sort by playtime desc
				owningGames.games = owningGames.games
					.sort((game1, game2) => game2.playtime_forever - game1.playtime_forever);
				caches.owningGames.set(userId, owningGames);
				return owningGames;
			}
			return undefined;
		}).catch(() => undefined);
	}
};

const getCurrentPlayers = async appid => {
	return await axios.get(
		STEAM.CURRENT_PLAYERS_URL,
		{ params: STEAM.GAME_ID_PARAMS(appid) }
	).then(body => {
		return body.data.response
			? body.data.response.player_count
			: 'N/A';
	}).catch(() => 'N/A');
};

module.exports = {
	getUserId: getUserId,
	getGame: getGame,
	getUserSummary: getUserSummary,
	getUserBanState: getUserBanState,
	getRecentlyPlayedGame: getRecentlyPlayedGame,
	getUserLevel: getUserLevel,
	getFriendList: getFriendList,
	getOwningGames: getOwningGames,
	getCurrentPlayers: getCurrentPlayers,
};
