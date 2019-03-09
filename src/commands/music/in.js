const { joinVoice } = require('@/music/helper');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { IN } = require('@/constants/commands/music');


module.exports = {
	name: IN.CMD,
	description: IN.DESC,
	devOnly: true,
	permissions: [
		PERMISSION.CONNECT,
	],
	execute: (context) => {
		const { author, msg } = context;
		const voiceChannel = author.voice.channel;
		if (!voiceChannel) {
			msg.error(ERROR.MUSIC.JOIN_VOICE_CHANNEL_FIRST);
			return;
		}
		joinVoice(voiceChannel, context);
	},
};
