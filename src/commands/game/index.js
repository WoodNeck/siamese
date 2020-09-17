const EMOJI = require('~/constants/emoji');
const { GAME } = require('~/constants/category');

module.exports = {
	name: GAME.NAME,
	description: GAME.DESC,
	categoryEmoji: EMOJI.VIDEO_GAME,
	commandEmoji: EMOJI.DICE,
};
