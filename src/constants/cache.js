// ttl & checkPeriod both in seconds
module.exports = {
	STEAM: {
		USER_ID: {
			ttl: 60 * 5,
			checkPeriod: 60,
		},
		GAME_ID: {
			ttl: 3600 * 5,
			checkPeriod: 3600,
		},
		OWNING_GAMES: {
			ttl: 3600,
			checkPeriod: 600,
		},
	},
};
