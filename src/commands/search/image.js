const axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const cheerio = require('cheerio');
const Recital = require('@/utils/recital');
const { EmbedPage } = require('@/utils/page');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { IMAGE } = require('@/constants/commands/search');
const { AXIOS_HEADER } = require('@/constants/header');
const { COOLDOWN } = require('@/constants/type');


// Needed for nsfw search
axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

module.exports = {
	name: IMAGE.CMD,
	description: IMAGE.DESC,
	usage: IMAGE.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
		PERMISSION.ADD_REACTIONS,
		PERMISSION.MANAGE_MESSAGES,
	],
	cooldown: COOLDOWN.PER_USER(3),
	execute: async ({ bot, msg, channel, content }) => {
		if (!content) {
			msg.error(ERROR.SEARCH.EMPTY_CONTENT);
			return;
		}
		await channel.startTyping();

		const searchText = content;
		await axios.get(IMAGE.SEARCH_URL, {
			params: IMAGE.SEARCH_PARAMS(searchText, !channel.nsfw),
			headers: AXIOS_HEADER,
			jar: cookieJar,
			withCredentials: true,
		}).then(body => {
			const images = findAllImages(body.data);
			if (!images.length) {
				msg.error(ERROR.SEARCH.EMPTY_RESULT(IMAGE.TARGET));
				return;
			}

			const recital = new Recital(bot, msg);
			const pages = images.map(imageUrl => {
				return new EmbedPage()
					.setImage(imageUrl);
			});
			recital.book.addPages(pages);
			recital.start(IMAGE.RECITAL_TIME);
		});
	},
};

const findAllImages = page => {
	const $ = cheerio.load(page);

	const images = $('.rg_meta').map(function() {
		const element = $(this);
		return JSON.parse(element.text()).ou;
	}).toArray();

	return images;
};
