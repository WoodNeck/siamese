const EMOJI = require('@/constants/emoji');


const COOLDOWN_TYPE = {
	PER_SERVER: 'PER_SERVER',
	PER_CHANNEL: 'PER_CHANNEL',
	PER_USER: 'PER_USER',
};
module.exports = {
	COOLDOWN: {
		TYPE: COOLDOWN_TYPE,
		PER_SERVER: seconds => {
			return {
				type: COOLDOWN_TYPE.PER_SERVER,
				time: seconds,
				key: 'guild',
			};
		},
		PER_CHANNEL: seconds => {
			return {
				type: COOLDOWN_TYPE.PER_CHANNEL,
				time: seconds,
				key: 'channel',
			};
		},
		PER_USER: seconds => {
			return {
				type: COOLDOWN_TYPE.PER_USER,
				time: seconds,
				key: 'author',
			};
		},
	},
	LOG_TYPE: {
		VERBOSE: 'VERBOSE',
		ERROR: 'ERROR',
	},
	RECITAL_END: {
		SHOULD_NOT_END: 'SHOULD_NOT_END',
		DELETE_ALL_MESSAGES: 'END_AND_DELETE_ALL_MESSAGE',
		REMOVE_ONLY_REACTIONS: 'END_AND_REMOVE_ONLY_REACTIONS',
		BY_USER: 'user',
	},
	MUSIC_TYPE: {
		YOUTUBE: 'YOUTUBE',
	},
	PLAYER_STATE: {
		INIT: 'INIT',
		PLAYING: 'PLAYING',
		PAUSED: 'PAUSED',
		PREPARING: 'PREPARING',
	},
	PLAYER_STATE_EMOJI: {
		INIT: EMOJI.HOURGLASS_NOT_DONE,
		PLAYING: EMOJI.PLAY,
		PAUSED: EMOJI.PAUSE,
		PREPARING: EMOJI.HOURGLASS_NOT_DONE,
	},
	ACTIVITY: {
		PLAYING: 'PLAYING',
		STREAMING: 'STREAMING',
		LISTENING: 'LISTENING',
		WATCHING: 'WATCHING',
	},
	PLAYER_END: {
		KILL: 'KILL',
		SKIP: 'SKIP',
	},
};
