const dedent = require('@/utils/dedent');
const Josa = require('josa-js');
const EMOJI = require('@/constants/emoji');
const { strong, underline, code } = require('@/utils/markdown');


module.exports = {
	DEV: {
		BOT_READY_INDICATOR: 'YOUR BOT IS READY AND RUNNING!',
		BOT_FAILED_TO_START: '❗ Your bot failed to start ❗',
		BOT_LANG_NOT_SPECIFIED: dedent`
			"BOT_LANG" is incorrect in your bot.env file!
			Check "BOT_LANG".js file exists in src/locale folder.`,
		ENV_VAR_MISSING: key => `You should provide env variable ${key}.`,
		ENV_VAR_NO_EMPTY_STRING: 'You should provide non-empty string for key',
		CMD_CATEGORY_LOAD_FAILED: category => `Load failed for category "${category}"(Check whether "index.js" file exists!)`,
		CMD_LOAD_FAILED: cmd => `Load failed for command "${cmd}".`,
		CMD_FAIL_TITLE: error => `${error.name}: ${error.message}`,
		CMD_FAIL_PLACE: msg => `${msg.guild}(${msg.guild.id}):${msg.channel}(${msg.channel.id})`,
		CMD_FAIL_CMD: msg => `While running command: ${strong(msg.content)}`,
		CMD_FAIL_DESC: error => `${error.stack}`,
		LOG_MODE_NOT_DEFINED: mode => dedent`
			Log mode "${mode}" is not defined as constant`,
		BOOK_CAN_ADD_ONLY_PAGE: 'Only page instance can be added to a book!',
		BOOK_EMPTY: 'Book entry is empty!',
		API_KEY_MISSING: 'API key is missing',
		API_TEST_EMPTY_RESULT: 'API test case returned empty result',
		VOICE_CANNOT_JOIN: 'Cannot join voice channel!',
		MUSIC_TYPE_NOT_DEFINED: type => dedent`
			Song type "${type}" is not defined in MUSIC_TYPE!`,
	},
	BOT: {
		READY_TITLE: bot => dedent`
			${bot.user.tag} 일할 준비 됐어용!`,
		READY_DESC: bot => dedent`
			- ${bot.guilds.size}개의 서버에서
			- ${bot.users.filter(user => !user.bot).size}명이 사용 중이에용!`,
		GUILD_JOIN_TITLE: bot => dedent`
			안뇽하세용 ${bot.user.username}에용!`,
		GUILD_JOIN_DESC: (bot, helpCmd) => dedent`
			${underline(strong(helpCmd))}이라고 말해주시면 ${Josa.r(bot.user.username, '이/가')} 할 수 있는 일을 알 수 있어용!`,
		GUILD_JOIN_FOOTER: bot => dedent`
			여기는 ${Josa.r(bot.user.username, '이/가')} 일하는 ${bot.guilds.size}번째 서버에용!`,
	},
	FORMAT: {
		ERROR_MSG: user => `${user.toString()}님, `,
	},
	PLAYER: {
		PLAYING_NEW_SONG: song => dedent`
			${EMOJI.MUSIC_NOTE} ${strong(song.meta.title)}${Josa.c(song.meta.title, '을/를')} 재생해용! ${code(song.meta.length ? song.meta.length.toString() : '')}`,
	},
};
