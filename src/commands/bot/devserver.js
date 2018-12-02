const { DEV_SERVER } = require('@/constants/commands/bot');


module.exports = {
	name: DEV_SERVER.CMD,
	description: DEV_SERVER.DESC,
	hidden: false,
	devOnly: false,
	permissions: [],
	execute: ({ bot, channel }) => {
		channel.send(DEV_SERVER.INVITE_LINK(bot, global.env.BOT_DEV_SERVER_INVITE));
	},
};
