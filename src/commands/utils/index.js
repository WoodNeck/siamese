module.exports = lang => {
	const { EMOJI, UTILS } = require('@/constants')(lang);


	return {
		name: UTILS.NAME,
		categoryEmoji: EMOJI.TOOLS,
		commandEmoji: EMOJI.SMALL_BLUE_DIAMOND,
	};
};
