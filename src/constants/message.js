const dedent = require('@/utils/dedent');
const Josa = require('josa-js');
const EMOJI = require('@/constants/emoji');
const FORMAT = require('@/constants/format');
const { strong, underline, code } = require('@/utils/markdown');


module.exports = {
	DEV: {
		BOT_READY_INDICATOR: ` _____ _
/  ___(_)
\\ \`--. _  __ _ _ __ ___   ___  ___  ___
 \`--. \\ |/ _\` | '_ \` _ \\ / _ \\/ __|/ _ \\
/\\__/ / | (_| | | | | | |  __/\\__ \\  __/
\\____/|_|\\__,_|_| |_| |_|\\___||___/\\___|
  YOUR BOT IS NOW READY AND RUNNING!`,
		BOT_FAILED_TO_START: '❗ Your bot failed to start ❗',
		BOT_LANG_NOT_SPECIFIED: dedent`
			"BOT_LANG" is incorrect in your bot.env file!
			Check "BOT_LANG".js file exists in src/locale folder.`,
		ENV_VAR_MISSING: key => `You should provide env variable ${key}.`,
		ENV_VAR_NO_EMPTY_STRING: 'You should provide non-empty string for key',
		CMD_CATEGORY_LOAD_FAILED: category => `Load failed for category "${category}"(Check whether "index.js" file exists!)`,
		CMD_LOAD_FAILED: cmd => `Load failed for command "${cmd}".`,
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
			${bot.user.tag} 일할 준비 됐다냥!`,
		READY_DESC: bot => dedent`
			- ${bot.guilds.size}개의 서버에서
			- ${bot.users.filter(user => !user.bot).size}명이 사용 중이다냥!`,
		GUILD_JOIN_TITLE: '안냥! 만나서 반갑다냥!',
		GUILD_JOIN_DESC: (bot, helpCmd) => dedent`
			${underline(strong(helpCmd))}이라고 말하면 ${Josa.r(bot.user.username, '이/가')} 할 수 있는 일을 알 수 있다냥!`,
		GUILD_JOIN_FOOTER: bot => dedent`
			여기는 ${Josa.r(bot.user.username, '이/가')} 일하는 ${bot.guilds.size}번째 서버다냥!`,
	},
	PLAYER: {
		PLAYING_NEW_SONG: song => dedent`
			${EMOJI.MUSIC_NOTE} ${strong(song.title)}${Josa.c(song.title, '을/를')} 재생한다냥! ${song.duration ? FORMAT.MUSIC_LENGTH(song.duration) : ''}`,
		ENQUEUE_NEW_SONG: song => dedent`
			${EMOJI.MUSIC_NOTE} ${strong(song.title)}${Josa.c(song.title, '을/를')} 재생목록에 추가한다냥! ${code(song.duration ? FORMAT.MUSIC_LENGTH(song.duration) : '')}`,
		ENQUEUE_NEW_LIST: playlist => dedent`
			${EMOJI.MUSIC_NOTES} ${strong(playlist.title)}의 ${strong(playlist.length.toString())}개 노래를 재생목록에 추가했다냥!`,
		ENABLE_LOOP: `${EMOJI.LOOP} 루프를 설정했다냥!`,
		DISABLE_LOOP: `${EMOJI.ARROW_RIGHT} 루프를 해제했다냥!`,
		RESUME: `${EMOJI.PLAY} 음악을 다시 재생한다냥!`,
		PAUSE: `${EMOJI.PAUSE} 음악을 일시정지한다냥!`,
		CANCLE: song => `${EMOJI.CROSS} ${strong(song.title)}${Josa.c(song.title, '을/를')} 재생목록에서 제거했다냥!`,
		SONG_TITLE: song => `${EMOJI.MUSIC_NOTE} ${strong(song.title)}`,
		SONG_PROGRESS: (song, progressed, statusEmoji, loop) => `${statusEmoji}${FORMAT.MUSIC_PROGRESS(progressed, song.duration)}[${FORMAT.MUSIC_LENGTH_NO_CLOCK(progressed)}/${FORMAT.MUSIC_LENGTH_NO_CLOCK(song.duration)}]${loop ? EMOJI.LOOP : ''}`,
	},
};
