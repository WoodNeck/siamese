module.exports = lang => {
	const { PING } = require('@/constants')(lang);
	const { strong } = require('@/utils/markdown');

	return {
		name: PING.CMD,
		description: PING.DESC,
		usage: null,
		hidden: false,
		devOnly: false,
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
};
