const ERROR = require('@/constants/error');
const { RESUME } = require('@/constants/command');
const { PLAYER } = require('@/constants/message');
const { PLAYER_STATE } = require('@/constants/type');

module.exports = {
	name: RESUME.CMD,
	description: RESUME.DESC,
	hidden: false,
	devOnly: false,
	permissions: [],
	execute: ({ msg, bot, guild, channel }) => {
		if (!bot.players.has(guild.id)) {
			msg.error(ERROR.MUSIC.NO_PLAYERS_AVAILABLE);
			return;
		}
		const player = bot.players.get(guild.id);
		player.state === PLAYER_STATE.PAUSED
			? (() => {
				player.resume();
				channel.send(PLAYER.RESUME);
			})()
			: msg.error(ERROR.MUSIC.STATE_MUST_BE_PAUSED);
	},
};
