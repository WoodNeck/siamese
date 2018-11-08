const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { IN } = require('@/constants/command');


module.exports = {
	name: IN.CMD,
	description: IN.DESC,
	hidden: false,
	devOnly: false,
	permission: [
		PERMISSION.VIEW_CHANNEL,
		PERMISSION.SEND_MESSAGES,
		PERMISSION.CONNECT,
	],
	execute: async ({ bot, author, msg }) => {
		const voiceChannel = author.voiceChannel;
		if (!voiceChannel) {
			msg.error(ERROR.MUSIC.JOIN_VOICE_CHANNEL_FIRST);
			return;
		}
		await voiceChannel.join()
			.catch(err => {
				msg.error(ERROR.MUSIC.JOIN_VOICE_CHANNEL_FAILED);
				bot.logger.error(err, msg);
			});
	},
};
