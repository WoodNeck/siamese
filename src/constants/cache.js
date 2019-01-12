// ttl & checkPeriod both in seconds
module.exports = {
	STEAM: {
		USER_ID: {
			ttl: 60 * 5,
			checkPeriod: 60,
		},
		OWNING_GAMES: {
			ttl: 60 * 60,
			checkPeriod: 600,
		},
	},
	HITOMI: {
		RANDOM_INDEX: {
			ttl: 60 * 60 * 5,
			checkPeriod: 600,
		},
	},
};
