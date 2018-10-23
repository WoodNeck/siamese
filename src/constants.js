const path = require('path');
const { readdirSync } = require('fs');
const { Collection } = require('discord.js');
const dedent = require('@/utils/dedent');
const { strong } = require('@/utils/markdown');

const constants = {
	LOG: {
		VERBOSE: 'VERBOSE',
		ERROR: 'ERROR',
	},
	COLOR: {
		TATARU: '#deadbf',
		VERBOSE: '#e5e5e5',
		ERROR: '#cc3300',
		WARNING: '#ffcc00',
		GOOD: '#99cc33',
		DEFAULT: 'DEFAULT',
		RANDOM: 'RANDOM',
	},
	EMOJI: {
		TOOLS: '🛠️',
		SMALL_BLUE_DIAMOND: '🔹',
		SMALL_ORANGE_DIAMOND: '🔸',
		SMALL_WHITE_SQUARE: '▫️',
		SPEAKING_HEAD: '🗣️',
		LOUD_SPEAKER: '📢',
		EXCLAMATION: '❗',
		BANGBANG: '‼️',
		DICE: '🎲',
		WWW: '🌐',
		ARROW_LEFT: '⬅',
		ARROW_RIGHT: '➡',
		CROSS: '❌',
		WARNING: '⚠️',
		WAVY_DASH: '〰️',
	},
	ACTIVITY: {
		PLAYING: 'PLAYING',
		STREAMING: 'STREAMING',
		LISTENING: 'LISTENING',
		WATCHING: 'WATCHING',
	},
	DEV: {
		BOT_READY_INDICATOR: 'YOUR BOT IS READY AND RUNNING!',
	},
	ERROR: {
		BOT_LANG_NOT_SPECIFIED: dedent`
			"BOT_LANG" is incorrect in your .env file!
			Check "BOT_LANG".js file exists in src/locale folder.`,
		ENV_VAR_MISSING: key => `You should provide env variable ${key}.`,
		ENV_VAR_NO_EMPTY_STRING: 'You should provide non-empty string for key',
		CMD_CATEGORY_LOAD_FAILED: category => `Load failed for category "${category}"(Check whether "index.js" file exists!)`,
		CMD_FAIL_TITLE: error => `${error.name}: ${error.message}`,
		CMD_FAIL_PLACE: msg => `${msg.guild}(${msg.guild.id}):${msg.channel}(${msg.channel.id})`,
		CMD_FAIL_CMD: msg => `While running command: ${strong(msg.content)}`,
		CMD_FAIL_DESC: error => `${error.stack}`,
		LOG_MODE_NOT_DEFINED: mode => dedent`
			Log mode "${mode}" is not defined as constant`,
		BOOK_CAN_ADD_ONLY_PAGE: 'Only page instance can be added to a book!',
		BOOK_EMPTY: 'Book entry is empty!',
	},
	AXIOS_HEADER: {
		'user-agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
	},
	RECITAL: {
		SHOULD_NOT_END: 'SHOULD_NOT_END',
		END_AND_DELETE_ALL_MESSAGES: 'END_AND_DELETE_ALL_MESSAGE',
		END_AND_REMOVE_ONLY_REACTIONS: 'END_AND_REMOVE_ONLY_REACTIONS',
	},
	// Commands
	DICE: {
		MIN: 2,
		MAX: 10000,
		DEFAULT: 100,
	},
	IMAGE: {
		RECITAL_TIME: 30,
	},
};

// Deep copy js Object only to depth 2
// Just for the constants system
const extend = (obj, newObj = {}) => {
	Object.keys(obj).forEach(category => {
		if (!newObj[category]) newObj[category] = {};
		const categoryObj = obj[category];
		Object.keys(categoryObj).forEach(key => {
			const value = categoryObj[key];
			newObj[category][key] = value;
		});
	});
	return newObj;
};

const mergedConstants = new Collection();
readdirSync(path.join(__dirname, 'locale'))
	.filter(file => file.endsWith('.js'))
	.forEach(localeFile => {
		const localeConstants = require(`@/locale/${localeFile}`);
		const lang = localeFile.split('.')[0];

		const mergedConstant = extend(localeConstants, extend(constants));
		mergedConstants.set(lang, mergedConstant);
	});

// if language is not providen, export only locale-independent constants
module.exports = lang => {
	if (lang && !mergedConstants.has(lang.toLowerCase())) {
		throw new Error(constants.DEV.BOT_LANG_NOT_SPECIFIED);
	}
	return lang
		? mergedConstants.get(lang.toLowerCase())
		: constants;
};
