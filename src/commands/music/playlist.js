const ERROR = require('@/constants/error');
const { PLAYLIST } = require('@/constants/commands/music');
const { PLAYLIST_ENTRY } = require('@/constants/format');
const { MESSAGE_MAX_LENGTH } = require('@/constants/discord');


module.exports = {
	name: PLAYLIST.CMD,
	description: PLAYLIST.DESC,
	hidden: false,
	devOnly: false,
	permissions: [],
	execute: async ({ msg, bot, guild, channel }) => {
		if (!bot.players.has(guild.id)) {
			msg.error(ERROR.MUSIC.NO_PLAYERS_AVAILABLE);
			return;
		}

		const player = bot.players.get(guild.id);
		const queue = player.queue;
		if (!queue.length) {
			msg.error(ERROR.MUSIC.QUEUE_EMPTY);
			return;
		}

		let playListStr = '';
		let index = 1;
		for (const song of queue) {
			const songStr = PLAYLIST_ENTRY(index, song);
			if (playListStr.length + songStr.length > MESSAGE_MAX_LENGTH) {
				await channel.send(playListStr);
				playListStr = '';
			}
			else {
				playListStr = `${playListStr}\n${songStr}`;
			}
			index += 1;
		}
		if (playListStr.length) {
			await channel.send(playListStr);
		}
	},
};
