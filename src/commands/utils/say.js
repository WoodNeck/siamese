module.exports = lang => {
	const { SAY } = require('@/constants')(lang);

	return {
		name: SAY.CMD,
		description: SAY.DESC,
		usage: SAY.USAGE,
		hidden: false,
		devOnly: false,
		execute: ({ msg, author, channel, content }) => {
			// Can't react for empty content
			if (!content) {
				channel.send(SAY.ERROR_EMPTY_CONTENT(author));
				return;
			}
			msg.delete();
			channel.send(content);
		},
	};
};
