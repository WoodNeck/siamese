const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { CHOOSE } = require('@/constants/command');


module.exports = {
	name: CHOOSE.CMD,
	description: CHOOSE.DESC,
	usage: CHOOSE.USAGE,
	hidden: false,
	devOnly: false,
	permission: [
		PERMISSION.VIEW_CHANNEL,
		PERMISSION.SEND_MESSAGES,
	],
	execute: ({ msg, channel, args }) => {
		// It needs least 2 arguments to choose
		(args.length >= 2)
			// irandom
			? channel.send(args[Math.random() * args.length | 0])
			: msg.error(ERROR.CHOOSE.ARG_NOT_SUFFICIENT);
	},
};
