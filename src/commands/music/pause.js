const ERROR = require('@/constants/error');
const { PAUSE } = require('@/constants/command');
const { PLAYER } = require('@/constants/message');
const { PLAYER_STATE } = require('@/constants/type');


module.exports = {
	name: PAUSE.CMD,
	description: PAUSE.DESC,
	hidden: false,
	devOnly: false,
	permissions: [],
	execute: ({ msg, bot, guild, channel }) => {
		if (!bot.players.has(guild.id)) {
			msg.error(ERROR.MUSIC.NO_PLAYERS_AVAILABLE);
			return;
		}
		const player = bot.players.get(guild.id);
		player.state === PLAYER_STATE.PLAYING
			? (() => {
				player.pause();
				channel.send(PLAYER.PAUSE);
			})()
			: msg.error(ERROR.MUSIC.STATE_MUST_BE_PLAYING);
	},
};
