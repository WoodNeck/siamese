module.exports = lang => {
	const { EMOJI, SEARCH } = require('@/constants')(lang);


	return {
		name: SEARCH.NAME,
		description: SEARCH.DESC,
		categoryEmoji: EMOJI.WWW,
		commandEmoji: EMOJI.SMALL_ORANGE_DIAMOND,
	};
};
