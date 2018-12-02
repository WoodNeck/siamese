const dedent = require('@/utils/dedent');
const Josa = require('josa-js');
const EMOJI = require('@/constants/emoji');
const FORMAT = require('@/constants/format');
const { strong, underline, code } = require('@/utils/markdown');


module.exports = {
	BOT: {
		READY_INDICATOR: bot => ` _____ _
/  ___(_)
\\ \`--. _  __ _ _ __ ___   ___  ___  ___
 \`--. \\ |/ _\` | '_ \` _ \\ / _ \\/ __|/ _ \\
/\\__/ / | (_| | | | | | |  __/\\__ \\  __/
\\____/|_|\\__,_|_| |_| |_|\\___||___/\\___|

- ${bot.user.tag}(GUILDS: ${bot.guilds.size}, USERS: ${bot.users.filter(user => !user.bot).size})`,
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
