module.exports = lang => {
	const { CHOOSE } = require('@/constants')(lang);

	return {
		name: CHOOSE.CMD,
		description: CHOOSE.DESC,
		usage: CHOOSE.USAGE,
		hidden: false,
		devOnly: false,
		execute: ({ msg, channel, args }) => {
			// It needs least 2 arguments to choose
			(args.length >= 2)
				// irandom
				? channel.send(args[Math.random() * args.length | 0])
				: msg.reply(CHOOSE.ERROR_ARG_NOT_SUFFICIENT);
		},
	};
};
