const chalk = require('chalk');
const dedent = require('@/utils/dedent');

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
		BLUE_DIAMOND: '🔷',
		SPEAKING_HEAD: '🗣️',
		LOUD_SPEAKER: '📢',
	},
	DEV: {
		BOT_READY_INDICATOR: 'BOT_READY',
		BOT_LANG_NOT_SPECIFIED: dedent`
			"BOT_LANG" is incorrect in your .env file!
			Check "BOT_LANG".js file exists in src/locale folder.`,
	},
};

try {
	module.exports = Object.assign(constants, require(`@/locale/${process.env.BOT_LANG.toLowerCase()}`));
}
catch (err) {
	console.error(chalk.hex(constants.COLOR.TATARU).bold(constants.DEV.BOT_LANG_NOT_SPECIFIED));
}
