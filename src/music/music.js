const Player = require('@/music/player');
const ERROR = require('@/constants/error');

// Music players, per server
const play = async (context, song) => {
	const { bot, author, guild, channel, msg } = context;

	if (bot.players.has(guild.id)) {
		// Add song to the queue
		const player = bot.players.get(guild.id);

		player.enqueue(song);
	}
	else {
		// Create new player
		const voiceChannel = author.voiceChannel;

		if (!voiceChannel) {
			msg.error(ERROR.MUSIC.JOIN_VOICE_CHANNEL_FIRST);
			return;
		}

		const connection = voiceChannel.connection
			? voiceChannel.connection
			: await voiceChannel.join()
				.catch(err => {
					msg.error(ERROR.MUSIC.JOIN_VOICE_CHANNEL_FAILED);
					bot.logger.error(err, msg);
				});
		const player = new Player(connection, channel, voiceChannel);

		player.enqueue(song);
		bot.players.set(guild.id, player);
	}
};


module.exports = {
	play: play,
};
