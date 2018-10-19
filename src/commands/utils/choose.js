module.exports = lang => {
	const { CHOOSE } = require('@/constants')(lang);

	return {
		name: CHOOSE.CMD,
		description: CHOOSE.DESC,
		usage: CHOOSE.USAGE,
		hidden: false,
		devOnly: false,
		execute: ({ author, channel, args }) => {
			// It needs least 2 arguments to choose
			channel.send((args.length >= 2) ?
				args[Math.random() * args.length | 0] :
				CHOOSE.ERROR_ARG_NOT_SUFFICIENT(author)
			);
		},
	};
};
