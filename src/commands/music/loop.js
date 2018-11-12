const ERROR = require('@/constants/error');
const { LOOP } = require('@/constants/commands/music');
const { PLAYER } = require('@/constants/message');

module.exports = {
	name: LOOP.CMD,
	description: LOOP.DESC,
	hidden: false,
	devOnly: false,
	permissions: [],
	execute: ({ msg, bot, guild, channel }) => {
		if (!bot.players.has(guild.id)) {
			msg.error(ERROR.MUSIC.NO_PLAYERS_AVAILABLE);
			return;
		}
		const player = bot.players.get(guild.id);
		player.loop = !player.loop;
		channel.send(
			player.loop
				? PLAYER.ENABLE_LOOP
				: PLAYER.DISABLE_LOOP
		);
	},
};
