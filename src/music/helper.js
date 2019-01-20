const { Constants } = require('discord.js');
const Player = require('@/music/player');
const ERROR = require('@/constants/error');


const joinVoice = async (voiceChannel, context) => {
	const { msg, bot, channel } = context;
	// Connection already exists
	if (voiceChannel.connection) {
		// Connection not established yet
		if (voiceChannel.status !== Constants.VoiceStatus.CONNECTED) {
			msg.error(ERROR.MUSIC.CONNECTION_NOT_ESTABLISHED_YET);
			return;
		}
		return voiceChannel.connection;
	}

	if (!voiceChannel.joinable) {
		msg.error(ERROR.MUSIC.NO_PERMISSION_GRANTED);
		return;
	}
	if (voiceChannel.full) {
		msg.error(ERROR.MUSIC.VOICE_CHANNEL_IS_FULL);
		return;
	}
	const connection = await voiceChannel.join();
	connection.on('error', err => {
		msg.error(ERROR.MUSIC.VOICE_CONNECTION_HAD_ERROR);
		bot.logger.error(err, msg);
	});
	connection.on('failed', err => {
		msg.error(ERROR.MUSIC.VOICE_CONNECTION_JOIN_FAILED);
		bot.logger.error(err, msg);
	});
	connection.on('reconnecting', () => {
		channel.send(ERROR.MUSIC.RECONNECTING);
	});
	return connection;
};

const aquirePlayer = async context => {
	const { bot, author, guild, channel, msg } = context;

	if (bot.players.has(guild.id)) {
		// return existing player
		return bot.players.get(guild.id);
	}
	else {
		// Create new player
		const voiceChannel = author.voiceChannel;

		if (!voiceChannel) {
			msg.error(ERROR.MUSIC.JOIN_VOICE_CHANNEL_FIRST);
			return;
		}

		const connection = await joinVoice(voiceChannel, context);
		if (connection) {
			const player = new Player(bot, guild, connection, channel);
			bot.players.set(guild.id, player);
			return player;
		}
	}
};

module.exports = {
	joinVoice: joinVoice,
	aquirePlayer: aquirePlayer,
};
