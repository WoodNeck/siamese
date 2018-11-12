const ERROR = require('@/constants/error');
const { OUT } = require('@/constants/commands/music');
const { PLAYER_END } = require('@/constants/type');


module.exports = {
	name: OUT.CMD,
	description: OUT.DESC,
	hidden: false,
	devOnly: false,
	permissions: [],
	execute: ({ msg, bot, guild }) => {
		const connection = bot.voiceConnections.get(guild.id);
		if (!connection) {
			msg.error(ERROR.MUSIC.NO_VOICE_CHANNEL_IN);
			return;
		}
		// kill player
		if (connection.dispatcher) {
			connection.dispatcher.end(PLAYER_END.KILL);
		}
		else {
			if (bot.players.has(guild.id)) {
				bot.players.delete(guild.id);
			}
			connection.disconnect();
		}
	},
};
