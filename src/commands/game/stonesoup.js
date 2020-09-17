const axios = require('axios');
const cheerio = require('cheerio');
const Recital = require('~/utils/recital');
const { EmbedPage, StringPage } = require('~/utils/page');
const { blockMd } = require('~/utils/markdown');
const COLOR = require('~/constants/emoji');
const EMOJI = require('~/constants/emoji');
const ERROR = require('~/constants/error');
const PERMISSION = require('~/constants/permission');
const { STONESOUP } = require('~/constants/commands/game');
const { AXIOS_HEADER } = require('~/constants/header');
const { RECITAL_END } = require('~/constants/type');
const { PAGE } = require('~/constants/format');


module.exports = {
	name: STONESOUP.CMD,
	description: STONESOUP.DESC,
	usage: STONESOUP.USAGE,
	hidden: true,
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
		let files = await axios.get(STONESOUP.TRUNK_URL(searchText), {
			headers: AXIOS_HEADER,
		}).then(body => {
			const $ = cheerio.load(body.data);
			const gameRegex = /^\w+-\w+-\d+-\d+\.txt$/;

			return $('tr').filter(function() {
				return gameRegex.test($(this).find('a').text());
			}).map(function() {
				return $(this).find('a').text();
			}).toArray();
		}).catch(() => {
			// 404 handled here;
			return;
		});

		if (!files) {
			msg.error(ERROR.SEARCH.EMPTY_RESULT(STONESOUP.TARGET.USER));
			return;
		}
		if (files && !files.length) {
			msg.error(ERROR.SEARCH.EMPTY_RESULT(STONESOUP.TARGET.GAMES));
			return;
		}

		// Get latest games
		files = files.length > STONESOUP.MAX_GAMES_TO_SHOW
			? files.slice(files.length - STONESOUP.MAX_GAMES_TO_SHOW, files.length)
			: files;

		const getGameInfo = async file => {
			return await axios.get(STONESOUP.DETAIL_URL(searchText, file), {
				headers: AXIOS_HEADER,
			}).then(body => body.data)
				.catch(() => {});
		};

		const gameInfos = await Promise.all(files.map(file => getGameInfo(file)));

		const versionRegex = /version \d+\.\d+/;
		const gameListRecital = new Recital(bot, msg);
		const gameList = gameInfos.map(gameInfo => {
			// Find the second double newline, for get the brief info only & fast
			let i = 0;
			let index = -1;
			while(i < 2) {
				index = gameInfo.indexOf('\n\n', index + 1);
				i += 1;
			}

			// Make page with brief info of game
			const lines = gameInfo.substr(0, index)
				.split('\n')
				.map(line => line.trim())
				.filter(line => line);
			const versionInfo = versionRegex.exec(lines.shift())[0];
			const title = lines.shift();
			const desc = lines.join('\n');
			return new EmbedPage()
				.setTitle(title)
				.setDescription(desc)
				.setFooter(`(${PAGE.CURRENT}/${PAGE.TOTAL}) - ${versionInfo}`)
				.setData(gameInfo);
		});
		gameListRecital.book.addPages(gameList);

		gameListRecital.addReactionCallback(EMOJI.PLAY, async () => {
			channel.startTyping();

			const game = gameListRecital.currentData;
			const infos = game.split(/\n{2,}/);
			const pages = [];

			// Make pages with infos, don't ask me why as game saves data just as it is.
			// Summary
			const summary = infos.slice(2, 9);
			pages.push(new StringPage()
				.setTitle(summary[0].replace(/\040{2,}/, ' - '))
				.setDescription(blockMd(summary.slice(1).join('\n\n')))
				.setColor(COLOR.BOT)
			);

			// Inventory
			const inventory = infos[10]
				.split('\n')
				.reduce((reduced, line) => {
					line.startsWith(' ')
						? reduced[reduced.length - 1].push(line)
						: reduced.push([line]);
					return reduced;
				}, []);
			const inventoryPage = new EmbedPage()
				.setTitle(STONESOUP.INVENTORY)
				.setColor(COLOR.BOT);
			inventory.forEach(lines => {
				inventoryPage.addField(lines[0], lines.slice(1).join('\n'), true);
			});
			pages.push(inventoryPage);

			// Ability & Mutations
			const mutationIndex = infos.indexOf('Innate Abilities, Weirdness & Mutations') + 1;
			if (mutationIndex > 0) {
				const mutation = infos[mutationIndex];
				pages.push(new EmbedPage()
					.setTitle(STONESOUP.MUTATION)
					.setDescription(mutation)
					.setColor(COLOR.BOT)
				);
			}

			// Message History
			const messageIndex = infos.indexOf('Message History') + 1;
			const message = infos[messageIndex];
			pages.push(new EmbedPage()
				.setTitle(STONESOUP.MESSAGE_HISTORY)
				.setDescription(message)
				.setColor(COLOR.BOT)
			);

			const gameDetailRecital = new Recital(bot, msg);
			gameDetailRecital.book.addPages(pages);
			gameDetailRecital.start(STONESOUP.RECITAL_TILE);

			return RECITAL_END.DELETE_ALL_MESSAGES;
		}, 1);

		gameListRecital.start(STONESOUP.RECITAL_TILE);
	},
};
