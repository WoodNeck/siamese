const ERROR = require('@/constants/error');
const { OUT } = require('@/constants/commands/music');


module.exports = {
	name: OUT.CMD,
	description: OUT.DESC,
	hidden: false,
	devOnly: false,
	permissions: [],
	execute: ({ msg, bot, guild }) => {
		const connection = bot.voiceConnections.get(guild.id);

		if (!bot.players.has(guild.id)) {
			if (!connection) {
				msg.error(ERROR.MUSIC.NO_VOICE_CHANNEL_IN);
			}
			else {
				// just leave voice channel
				connection.disconnect();
			}
			return;
		}

		const player = bot.players.get(guild.id);
		player.end();
	},
};
