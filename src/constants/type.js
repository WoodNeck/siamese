const EMOJI = require('@/constants/emoji');


module.exports = {
	COOLDOWN: {
		PER_GUILD: seconds => {
			return {
				time: seconds,
				key: 'guild',
			};
		},
		PER_CHANNEL: seconds => {
			return {
				time: seconds,
				key: 'channel',
			};
		},
		PER_USER: seconds => {
			return {
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
		TTS: 'TTS',
	},
	PLAYER_STATE: {
		INIT: 'INIT',
		PENDING: 'PENDING',
		PLAYING: 'PLAYING',
		PAUSED: 'PAUSED',
		PREPARING: 'PREPARING',
	},
	PLAYER_STATE_EMOJI: {
		INIT: EMOJI.HOURGLASS_NOT_DONE,
		PENDING: EMOJI.HOURGLASS_NOT_DONE,
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
	// End type of conversation's dialogue
	DIALOGUE: {
		VALID: 'VALID',
		INVALID: 'INVALID',
		NO_RESPONSE: 'user',
	},
};
