module.exports = lang => {
	const { EMOJI, UTILS } = require('@/constants')(lang);
	return {
		categoryEmoji: EMOJI.TOOLS,
		commandEmoji: EMOJI.SMALL_BLUE_DIAMOND,
		name: UTILS.NAME,
	};
};
