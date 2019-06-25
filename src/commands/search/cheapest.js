const axios = require('axios');
const Recital = require('@/utils/recital');
const { EmbedPage } = require('@/utils/page');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { CHEAPEST } = require('@/constants/commands/search');
const { AXIOS_HEADER } = require('@/constants/header');


module.exports = {
	name: CHEAPEST.CMD,
	description: CHEAPEST.DESC,
	usage: CHEAPEST.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
		PERMISSION.ADD_REACTIONS,
		PERMISSION.MANAGE_MESSAGES,
	],
	execute: async ({ bot, msg, channel, content }) => {
		if (!content) {
			msg.error(ERROR.SEARCH.EMPTY_CONTENT);
			return;
		}
		channel.startTyping();

		const searchText = content;
		const games = await axios.get(CHEAPEST.SEARCH_URL, {
			params: CHEAPEST.SEARCH_PARAMS(searchText),
			headers: AXIOS_HEADER,
		}).then(body => body.data);

		if (!games.length) {
			msg.error(ERROR.SEARCH.EMPTY_RESULT(CHEAPEST.TARGET));
			return;
		}

		const recital = new Recital(bot, msg);
		const pages = games.map(game => {
			return new EmbedPage()
				.setTitle(game.title)
				.setDescription(CHEAPEST.GAME_DESC(
					game.salePrice,
					game.normalPrice,
					parseInt(game.savings, 10),
					parseInt(game.metacriticScore, 10),
				))
				.setThumbnail(game.thumb)
				.setFooter(CHEAPEST.REVIEW_FOOTER(
					CHEAPEST.REVIEW_TEXT[game.steamRatingText],
					game.steamRatingPercent,
					game.steamRatingCount,
				), CHEAPEST.REVIEW_ICON(parseInt(game.steamRatingPercent, 10)))
				.setURL(CHEAPEST.REDIRECT_URL(game.dealID));
		});
		recital.book.addPages(pages);
		recital.start(CHEAPEST.RECITAL_TIME);
	},
};
