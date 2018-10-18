const { PING } = require('@/constants');
const { strong } = require('@/utils/markdown');


module.exports = {
	name: PING.CMD,
	description: PING.DESC,
	usage: null,
	hidden: false,
	devOnly: false,
	execute: ({ bot, channel }) => {
		const uptime = bot.uptime / 1000;
		const ping = strong(`${bot.ping.toFixed(1)}ms`);
		const botMention = bot.user.toString();

		channel.send(PING.MSG(ping, botMention, {
			hours: Math.floor(uptime / 3600),
			minutes: Math.floor((uptime % 3600) / 60),
			seconds: Math.floor(uptime % 60),
		}));
	},
};
