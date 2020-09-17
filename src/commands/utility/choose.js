const ERROR = require('~/constants/error');
const { CHOOSE } = require('~/constants/commands/utility');


module.exports = {
	name: CHOOSE.CMD,
	description: CHOOSE.DESC,
	usage: CHOOSE.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [],
	execute: ({ msg, channel, args }) => {
		// It needs least 2 arguments to choose
		(args.length >= 2)
			// irandom
			? channel.send(args[Math.random() * args.length | 0])
			: msg.error(ERROR.CHOOSE.ARG_NOT_SUFFICIENT);
	},
};
