const ERROR = require('@/constants/error');
const { CANCEL } = require('@/constants/command');
const { PLAYER } = require('@/constants/message');


module.exports = {
	name: CANCEL.CMD,
	description: CANCEL.DESC,
	hidden: false,
	devOnly: false,
	permissions: [],
	execute: ({ msg, bot, guild, args, channel }) => {
		if (!args.length) {
			msg.error(ERROR.MUSIC.PLAYLIST_INDEX_NO_INTEGER);
			return;
		}
		if (!bot.players.has(guild.id)) {
			msg.error(ERROR.MUSIC.NO_PLAYERS_AVAILABLE);
			return;
		}

		const player = bot.players.get(guild.id);
		const isNum = /^\d+$/;
		// Non-number case
		if (!isNum.test(args[0])) {
			msg.error(ERROR.MUSIC.PLAYLIST_INDEX_NO_INTEGER);
			return;
		}
		const indexToRemove = parseInt(args[0], 10);
		if (indexToRemove <= 0 || indexToRemove > player.queue.length) {
			msg.error(ERROR.MUSIC.PLAYLIST_INDEX_OUT_OF_RANGE(1, player.queue.length));
			return;
		}
		const removedSong = player.remove(indexToRemove);
		channel.send(PLAYER.CANCLE(removedSong));
	},
};
