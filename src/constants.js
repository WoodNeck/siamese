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
		TOOLS: '🛠️',
		SMALL_BLUE_DIAMOND: '🔹',
		SPEAKING_HEAD: '🗣️',
		LOUD_SPEAKER: '📢',
	},
	DEV: {
		BOT_READY_INDICATOR: 'YOUR BOT IS READY AND RUNNING!',
		BOT_LANG_NOT_SPECIFIED: dedent`
			"BOT_LANG" is incorrect in your .env file!
			Check "BOT_LANG".js file exists in src/locale folder.`,
		ENV_VAR_MISSING: key => `You should provide env variable ${key}.`,
		ENV_VAR_NO_EMPTY_STRING: 'You should provide non-empty string for key',
		CMD_CATEGORY_LOAD_FAILED: category => `Load failed for category "${category}"(Check whether "index.js" file exists!)`,
		CMD_FAIL_TITLE: error => `${error.name}: ${error.message}`,
		CMD_FAIL_DESC: (msg, error) => dedent`
			${msg.guild}(${msg.guild.id}):${msg.channel}(${msg.channel.id})
			${error.stack}`,
	},
};

try {
	module.exports = lang => lang ?
		Object.assign(constants, require(`@/locale/${lang.toLowerCase()}`)) :
		constants;
}
catch (err) {
	console.error(chalk.hex(constants.COLOR.ERROR).bold(constants.DEV.BOT_LANG_NOT_SPECIFIED));
}
