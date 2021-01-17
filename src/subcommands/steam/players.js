const { getGames, getCurrentPlayers } = require('~/helper/steam');
const Recital = require('~/utils/recital');
const { EmbedPage } = require('~/utils/page');
const ERROR = require('~/const/error');
const PERMISSION = require('~/const/permission');
const { STEAM, PLAYERS } = require('~/const/commands/steam');


module.exports = {
	name: PLAYERS.CMD,
	description: PLAYERS.DESC,
	usage: PLAYERS.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
	],
	execute: async ({ bot, msg, channel, content }) => {
		if (!content) {
			msg.error(ERROR.SEARCH.EMPTY_CONTENT);
			return;
		}
		channel.startTyping();

		const games = await getGames(content);
		if (!games.length) {
			msg.error(ERROR.SEARCH.EMPTY_RESULT(PLAYERS.TARGET));
			return;
		}

		const getAllCurrentPlayers = games.map(async game => getCurrentPlayers(game.id));

		const currentPlayers = await Promise.all(getAllCurrentPlayers);

		const recital = new Recital(bot, msg);
		const pages = games.map((game, idx) => {
			const currentPlayer = currentPlayers[idx];

			const page = new EmbedPage()
				.setTitle(game.name)
				.setDescription(PLAYERS.CURRENT(currentPlayer))
				.setURL(STEAM.STORE_URL(game.id));
			if (game.tiny_image) {
				page.setThumbnail(game.tiny_image);
			}
			return page;
		});

		recital.book.addPages(pages);
		recital.start(PLAYERS.RECITAL_TIME);
	},
};
