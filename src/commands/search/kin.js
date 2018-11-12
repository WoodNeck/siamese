const axios = require('axios');
const unescape = require('unescape');
const Recital = require('@/utils/recital');
const { EmbedPage } = require('@/utils/page');
const { blockMd } = require('@/utils/markdown');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { DEV } = require('@/constants/message');
const { KIN } = require('@/constants/commands/search');
const { NAVER_HEADER } = require('@/constants/header');

module.exports = {
	name: KIN.CMD,
	description: KIN.DESC,
	usage: KIN.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
		PERMISSION.ADD_REACTIONS,
		PERMISSION.MANAGE_MESSAGES,
	],
	checkLoadable: async () => {
		if (!global.env.NAVER_ID || !global.env.NAVER_SECRET) {
			throw new Error(DEV.API_KEY_MISSING);
		}
		const body = await axios.get(KIN.SEARCH_URL, {
			params: KIN.SEARCH_PARAMS('TEST'),
			headers: NAVER_HEADER,
		});
		if (!body.data.total || body.data.total <= 0) {
			throw new Error(DEV.API_TEST_EMPTY_RESULT);
		}
	},
	execute: async ({ bot, msg, channel, content }) => {
		if (!content) {
			msg.error(ERROR.SEARCH.EMPTY_CONTENT);
			return;
		}
		await channel.startTyping();

		const searchText = content;
		await axios.get(KIN.SEARCH_URL, {
			params: KIN.SEARCH_PARAMS(searchText),
			headers: NAVER_HEADER,
		}).then(body => {
			if (!body.data.total) {
				msg.error(ERROR.SEARCH.EMPTY_RESULT(KIN.TARGET));
				return;
			}

			const items = body.data.items;
			const pages = [];
			const lastPage = items.reduce((page, searchResult) => {
				// Result emphasis query with <b></b> tag, so have to escape it
				const bTag = /<(\/)*b>/gi;
				const title = unescape(searchResult.title.replace(bTag, ''));
				const desc = blockMd(unescape(searchResult.description.replace(bTag, '')));

				if (page.content.fields.length < KIN.ITEMS_PER_PAGE) {
					page.addField(title, desc);
					return page;
				}
				else {
					pages.push(page);
					const newPage = new EmbedPage();
					newPage.addField(title, desc);
					return newPage;
				}
			}, new EmbedPage());
			if (lastPage.content.fields.length > 0) {
				pages.push(lastPage);
			}

			const recital = new Recital(bot, msg);
			recital.book.addPages(pages);
			recital.start(KIN.RECITAL_TIME);
		});
	},
};
