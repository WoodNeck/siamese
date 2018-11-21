// ttl & checkPeriod both in seconds
module.exports = {
	STEAM: {
		USER_ID: {
			ttl: 60 * 5,
			checkPeriod: 60,
		},
		OWNING_GAMES: {
			ttl: 3600,
			checkPeriod: 600,
		},
	},
};
