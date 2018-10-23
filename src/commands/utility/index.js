module.exports = lang => {
	const { EMOJI, UTILITY } = require('@/constants')(lang);


	return {
		name: UTILITY.NAME,
		description: UTILITY.DESC,
		categoryEmoji: EMOJI.TOOLS,
		commandEmoji: EMOJI.SMALL_BLUE_DIAMOND,
	};
};
