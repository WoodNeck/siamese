const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');

const Recital = require('@/utils/recital');
const { EmbedPage } = require('@/utils/page');
const PERMISSION = require('@/constants/permission');
const CACHE = require('@/constants/cache');
const { STEAM, TOP } = require('@/constants/commands/steam');
const { AXIOS_HEADER } = require('@/constants/header');
const { PAGE } = require('@/constants/format');


const cache = new NodeCache({
	stdTTL: CACHE.STEAM.TOP_GAMES.ttl,
	checkperiod: CACHE.STEAM.TOP_GAMES.checkPeriod,
});

module.exports = {
	name: TOP.CMD,
	description: TOP.DESC,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
	],
	execute: async ({ bot, msg, channel }) => {
		channel.startTyping();

		let games = cache.get(TOP.CMD);

		if (!games) {
			const page = await axios.get(TOP.SEARCH_URL, {
				headers: AXIOS_HEADER,
			}).then(body => body.data);

			const $ = cheerio.load(page);
			const rows = $('#detailStats').find('.player_count_row');
			games = [];
			rows.each((idx, el) => {
				games.push([...el.children.map(child => $(child).text().trim())].filter(text => text));
			});

			cache.set(TOP.CMD, games);
		}

		const perPage = TOP.GAMES_PER_PAGE;
		const maxPage = games.length / perPage;
		const pages = [];

		for (let pageNum = 0; pageNum < maxPage; pageNum++) {
			const gamesSliced = games.slice(perPage * pageNum, perPage * (pageNum + 1));
			const page = new EmbedPage();

			gamesSliced.forEach((game, index) => page.addField(
				TOP.GAME_TITLE(perPage * pageNum + index + 1, game),
				TOP.GAME_STATISTICS(game),
			));
			page.setFooter(`${PAGE.CURRENT}/${PAGE.TOTAL} - ${TOP.FORMAT_INFO}`, STEAM.ICON_URL);

			pages.push(page);
		}

		const recital = new Recital(bot, msg);
		recital.book.addPages(pages);

		recital.start(TOP.RECITAL_TIME);
	},
};
