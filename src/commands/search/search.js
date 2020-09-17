const axios = require('axios');
const cheerio = require('cheerio');
const Recital = require('~/utils/recital');
const { EmbedPage } = require('~/utils/page');
const ERROR = require('~/constants/error');
const PERMISSION = require('~/constants/permission');
const { SEARCH } = require('~/constants/commands/search');
const { AXIOS_HEADER } = require('~/constants/header');
const { COOLDOWN } = require('~/constants/type');

module.exports = {
	name: SEARCH.CMD,
	description: SEARCH.DESC,
	usage: SEARCH.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
		PERMISSION.ADD_REACTIONS,
		PERMISSION.MANAGE_MESSAGES,
	],
	cooldown: COOLDOWN.PER_USER(5),
	execute: async ({ bot, channel, msg, content }) => {
		if (!content) {
			msg.error(ERROR.SEARCH.EMPTY_CONTENT);
			return;
		}

		channel.startTyping();

		const searchText = content;
		await axios.get(SEARCH.URL, {
			params: SEARCH.PARAMS(searchText),
			headers: AXIOS_HEADER,
		}).then(body => {
			const $ = cheerio.load(body.data);
			const items = $('.rc');

			if (items.length === 0) {
				msg.error(ERROR.SEARCH.EMPTY_RESULT(SEARCH.TARGET));
				return;
			}

			const pages = items.map(function() {
				const el = $(this);

				const title = el.find('h3').text();

				const descWrapper = el.find('.s');

				const desc = descWrapper[0].children.length > 1
					?	$(descWrapper[0].children[0]).text() + '\n' + descWrapper[0].children[1].children
						.map((span) => $(span).text()).join('\n')
					: descWrapper[0].children[0].children
						.map((span) => $(span).text()).join('\n');
				const url = el.find('a').attr('href');

				return new EmbedPage()
					.setTitle(title)
					.setDescription(desc)
					.setURL(url);
			}).toArray();

			const recital = new Recital(bot, msg);
			recital.book.addPages(pages);
			recital.start(SEARCH.RECITAL_TIME);
		});
	},
};
