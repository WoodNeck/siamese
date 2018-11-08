const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { OUT } = require('@/constants/command');


module.exports = {
	name: OUT.CMD,
	description: OUT.DESC,
	hidden: false,
	devOnly: false,
	permission: [
		PERMISSION.VIEW_CHANNEL,
		PERMISSION.SEND_MESSAGES,
	],
	execute: ({ msg, bot, guild }) => {
		const connection = bot.voiceConnections.get(guild.id);
		if (!connection) {
			msg.error(ERROR.MUSIC.NO_VOICE_CHANNEL_IN);
			return;
		}
		connection.disconnect();
	},
};
