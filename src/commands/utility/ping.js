const { PING } = require('@/constants/command');
const { strong } = require('@/utils/markdown');

module.exports = {
	name: PING.CMD,
	description: PING.DESC,
	hidden: false,
	devOnly: false,
	permissions: [],
	execute: ({ bot, guild, channel }) => {
		const uptime = bot.uptime / 1000;
		const ping = strong(`${bot.ping.toFixed(1)}ms`);

		channel.send(PING.MSG(ping, bot, guild, {
			hours: Math.floor(uptime / 3600),
			minutes: Math.floor((uptime % 3600) / 60),
			seconds: Math.floor(uptime % 60),
		}));
	},
};
