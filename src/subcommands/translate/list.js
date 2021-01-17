const Recital = require('~/utils/recital');
const { EmbedPage } = require('~/utils/page');
const PERMISSION = require('~/const/permission');
const { TRANSLATE } = require('~/const/commands/useful');
const { COOLDOWN } = require('~/const/type');

module.exports = {
	name: TRANSLATE.LIST.CMD,
	description: TRANSLATE.LIST.DESC,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
		PERMISSION.ADD_REACTIONS,
		PERMISSION.MANAGE_MESSAGES,
	],
	cooldown: COOLDOWN.PER_USER(5),
	execute: async ({ bot, msg, channel }) => {
		channel.startTyping();

		const langs = Object.keys(TRANSLATE.LANGS);
		const pages = [];
		const totalPages = Math.floor((langs.length - 1) / TRANSLATE.LIST.ENTRY_PER_PAGE);

		for (const i of [...Array(totalPages).keys()]) {
			const infosDesc = langs.slice(i * TRANSLATE.LIST.ENTRY_PER_PAGE, (i + 1) * TRANSLATE.LIST.ENTRY_PER_PAGE)
				.map(info => TRANSLATE.LIST.ENTRY(info))
				.join('\n');
			pages.push(new EmbedPage()
				.setDescription(infosDesc)
			);
		}

		const recital = new Recital(bot, msg);
		recital.book.addPages(pages);
		recital.start(TRANSLATE.LIST.RECITAL_TIME);
	},
};
