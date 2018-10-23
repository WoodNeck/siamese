const error = require('@/utils/error');


module.exports = lang => {
	const { SAY } = require('@/constants')(lang);

	return {
		name: SAY.CMD,
		description: SAY.DESC,
		usage: SAY.USAGE,
		hidden: false,
		devOnly: false,
		execute: ({ msg, author, channel, content, locale }) => {
			// Can't react for empty content
			if (!content) {
				channel.send(error(SAY.ERROR_EMPTY_CONTENT, locale).by(author));
				return;
			}
			msg.delete();
			channel.send(content);
		},
	};
};
