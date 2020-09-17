const axios = require('axios');
const Recital = require('~/utils/recital');
const { EmbedPage } = require('~/utils/page');
const COLOR = require('~/constants/color');
const ERROR = require('~/constants/error');
const PERMISSION = require('~/constants/permission');
const { SHOPPING } = require('~/constants/commands/search');
const { NAVER_HEADER } = require('~/constants/header');

module.exports = {
	name: SHOPPING.CMD,
	description: SHOPPING.DESC,
	usage: SHOPPING.USAGE,
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
		await axios.get(SHOPPING.SEARCH_URL, {
			params: SHOPPING.SEARCH_PARAMS(searchText),
			headers: NAVER_HEADER,
		}).then(body => {
			if (!body.data.total) {
				msg.error(ERROR.SEARCH.EMPTY_RESULT(SHOPPING.TARGET));
				return;
			}

			// const items = body.data.items;
			const pages = body.data.items.map(item => {
				// Result emphasis query with <b></b> tag, so have to escape it
				const bTag = /<(\/)*b>/gi;
				const title = item.title.replace(bTag, '');
				const price = SHOPPING.PRICE(
					parseInt(item.lprice, 10),
					parseInt(item.hprice, 10)
				);
				const productType = SHOPPING.PRODUCT_TYPE[item.productType];
				return new EmbedPage()
					.setTitle(title)
					.setDescription(price)
					.setURL(item.link)
					.setFooter(`${item.mallName} - ${productType}`)
					.setThumbnail(item.image)
					.setColor(COLOR.BOT);
			});

			const recital = new Recital(bot, msg);
			recital.book.addPages(pages);
			recital.start(SHOPPING.RECITAL_TIME);
		});
	},
};
