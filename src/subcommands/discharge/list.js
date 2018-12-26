const Recital = require('@/utils/recital');
const { EmbedPage } = require('@/utils/page');
const Discharge = require('@/model/discharge');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { DISCHARGE_LIST } = require('@/constants/commands/history');


module.exports = {
	name: DISCHARGE_LIST.CMD,
	description: DISCHARGE_LIST.DESC,
	hidden: false,
	devOnly: false,
	permissions: [PERMISSION.EMBED_LINKS],
	execute: async ({ bot, channel, guild, msg }) => {
		await channel.startTyping();

		const infos = await Discharge.find({
			guildId: guild.id,
		}).exec();

		if (!infos.length) {
			msg.error(ERROR.DISCHARGE.EMPTY_RESULT);
			return;
		}

		const pages = [];
		const totalPages = Math.floor((infos.length - 1) / DISCHARGE_LIST.ENTRY_PER_PAGE) + 1;

		for (const i of [...Array(totalPages).keys()]) {
			const infosDesc = infos.slice(i * DISCHARGE_LIST.ENTRY_PER_PAGE, (i + 1) * DISCHARGE_LIST.ENTRY_PER_PAGE)
				.map(info => DISCHARGE_LIST.ENTRY(info))
				.join('\n');
			pages.push(new EmbedPage()
				.setDescription(infosDesc)
			);
		}

		const recital = new Recital(bot, msg);
		recital.book.addPages(pages);
		recital.start(DISCHARGE_LIST.RECITAL_TIME);
	},
};
