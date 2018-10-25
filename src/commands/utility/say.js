module.exports = lang => {
	const { SAY } = require('@/constants')(lang);

	return {
		name: SAY.CMD,
		description: SAY.DESC,
		usage: SAY.USAGE,
		hidden: false,
		devOnly: false,
		execute: ({ msg, channel, content }) => {
			// Can't react for empty content
			if (!content) {
				msg.reply(SAY.ERROR_EMPTY_CONTENT);
				return;
			}
			msg.delete();
			channel.send(content);
		},
	};
};
