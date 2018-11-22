const { getUserId, getUserSummary, getOwningGames } = require('@/helper/steam');
const Recital = require('@/utils/recital');
const { EmbedPage } = require('@/utils/page');
const EMOJI = require('@/constants/emoji');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { STEAM, LIBRARY } = require('@/constants/commands/steam');

module.exports = {
	name: LIBRARY.CMD,
	description: LIBRARY.DESC,
	usage: LIBRARY.USAGE,
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
		await channel.startTyping();

		// Find out 64-bit encoded steamid
		const searchText = content;
		const userId = await getUserId(searchText);
		if (!userId) {
			msg.error(ERROR.STEAM.USER_NOT_FOUND);
			return;
		}

		// Get user summary
		const summary = await getUserSummary(userId);
		if (!summary) {
			msg.error(ERROR.STEAM.USER_NOT_FOUND);
			return;
		}

		// Get games owning
		const owningGames = await getOwningGames(userId);
		if (!owningGames || !owningGames.game_count) {
			msg.error(ERROR.STEAM.EMPTY_GAMES);
			return;
		}

		const pages = [];
		const totalPages = Math.min(Math.floor((owningGames.game_count - 1) / LIBRARY.GAMES_PER_PAGE) + 1, LIBRARY.MAX_PAGES);
		for (const i of [...Array(totalPages).keys()]) {
			const games = owningGames.games.slice(i * LIBRARY.GAMES_PER_PAGE, (i + 1) * LIBRARY.GAMES_PER_PAGE);
			const gameDescs = [];
			games.forEach(game => {
				gameDescs.push(`${EMOJI.VIDEO_GAME} ${game.name} - ${STEAM.PLAYTIME_SHORT(game.playtime_forever)}`);
			});
			pages.push(new EmbedPage()
				.setTitle(summary.personaname)
				.setUrl(STEAM.PROFILE_GAME_URL(summary.profileurl))
				.setThumbnail(summary.avatarmedium)
				.setDescription(gameDescs.join('\n'))
			);
		}

		const recital = new Recital(bot, msg);
		recital.book.addPages(pages);
		recital.start(LIBRARY.RECITAL_TIME);
	},
};
