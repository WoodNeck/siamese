const EMOJI = require('@/constants/emoji');
const { NSFW } = require('@/constants/category');


module.exports = {
	name: NSFW.NAME,
	description: NSFW.DESC,
	categoryEmoji: EMOJI.NSFW,
	commandEmoji: EMOJI.EGGPLANT,
};
