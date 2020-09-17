const EMOJI = require('~/constants/emoji');
const { BOT } = require('~/constants/category');

module.exports = {
	name: BOT.NAME,
	description: BOT.DESC,
	categoryEmoji: EMOJI.BOT,
	commandEmoji: EMOJI.WRENCH,
};
