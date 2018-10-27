const axios = require('axios');
const Recital = require('@/utils/recital');
const { EmbedPage } = require('@/utils/page');


module.exports = lang => {
	const { KIN, SEARCH, NAVER_HEADER } = require('@/constants')(lang);

	return {
		name: KIN.CMD,
		description: KIN.DESC,
		usage: KIN.USAGE,
		hidden: false,
		devOnly: false,
		checkLoadable: async () => {
			if (!global.env.NAVER_ID) return false;
			if (!global.env.NAVER_SECRET) return false;
			const apiAvailability = await axios.get(KIN.SEARCH_URL('TEST'), {
				headers: NAVER_HEADER,
			}).then(body => body.data.total > 0)
				.catch(() => false);
			return apiAvailability;
		},
		execute: async ({ bot, msg, channel, content }) => {
			if (!content) {
				msg.reply(SEARCH.ERROR_EMPTY_CONTENT);
				return;
			}
			await channel.startTyping();

			const searchText = encodeURIComponent(content);
			await axios.get(KIN.SEARCH_URL(searchText), {
				headers: NAVER_HEADER,
			}).then(body => {
				if (!body.data.total) {
					msg.reply(SEARCH.ERROR_EMPTY_RESULT(KIN.TARGET));
					return;
				}

				const items = body.data.items;
				const pages = items.map(searchResult => {
					// Result emphasis query with <b></b> tag, so have to escape it
					const bTag = /<(\/)*b>/gi;
					const title = searchResult.title.replace(bTag, '');
					const desc = searchResult.description.replace(bTag, '');
					return new EmbedPage()
						.setTitle(title)
						.setDescription(desc);
				});

				const recital = new Recital(bot, msg);
				recital.book.addPages(pages);
				recital.start(KIN.RECITAL_TIME);
			});

			await channel.stopTyping();
		},
	};
};
