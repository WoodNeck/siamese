const { joinVoice } = require('@/music/helper');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { IN } = require('@/constants/commands/music');


module.exports = {
	name: IN.CMD,
	description: IN.DESC,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.CONNECT,
	],
	execute: (context) => {
		const { author, msg } = context;
		const voiceChannel = author.voiceChannel;
		if (!voiceChannel) {
			msg.error(ERROR.MUSIC.JOIN_VOICE_CHANNEL_FIRST);
			return;
		}
		joinVoice(voiceChannel, context);
	},
};
