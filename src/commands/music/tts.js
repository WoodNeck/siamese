const Song = require('@/music/song');
const { aquirePlayer } = require('@/music/helper');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { TTS } = require('@/constants/commands/music');
const { MUSIC_TYPE } = require('@/constants/type');


module.exports = {
	name: TTS.CMD,
	description: TTS.DESC,
	usage: TTS.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.MANAGE_MESSAGES,
		PERMISSION.CONNECT,
		PERMISSION.SPEAK,
	],
	execute: async context => {
		const { author, content, msg, channel } = context;
		if (!content.length) {
			msg.error(ERROR.CMD.EMPTY_CONTENT(TTS.TARGET));
			return;
		}
		if (content.length > TTS.MAX_LENGTH) {
			msg.error(ERROR.MUSIC.TTS_MESSAGE_TO_LONG(TTS.MAX_LENGTH));
			return;
		}

		channel.startTyping();

		const song = new Song(
			content,
			MUSIC_TYPE.TTS,
			content,
			null,
			author,
		);
		const player = await aquirePlayer(context);

		if (player) {
			await player.enqueue(song, channel);
		}
	},
};
