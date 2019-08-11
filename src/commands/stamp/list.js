const Directory = require('@/model/directory');
const Image = require('@/model/image');
const Recital = require('@/utils/recital');
const { EmbedPage } = require('@/utils/page');
const ERROR = require('@/constants/error');
const { LIST } = require('@/constants/commands/stamp');

module.exports = {
	name: LIST.CMD,
	description: LIST.DESC,
	usage: LIST.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [],
	execute: async ({ bot, guild, msg, args }) => {
		const dirName = args[0];
		const directory = dirName
			? await Directory.findOne({ name: dirName, guildId: guild.id }).exec()
			: { _id: 0 };
		if (!directory) {
			msg.error(ERROR.FILE.NO_DIRECTORY);
			return;
		}
		let directories = dirName
			? []
			: await Directory.find({ guildId: guild.id }).exec();
		directories = directories.map(dir => {
			return {
				name: dir.name,
				type: LIST.TYPE.DIRECTORY,
			};
		});

		let images = await Image.find({ guildId: guild.id, dirId: directory._id }).exec();
		images = images.map(dir => {
			return {
				name: dir.name,
				type: LIST.TYPE.IMAGE,
			};
		});
		const items = [...directories, ...images];
		const pageCnt = Math.ceil(items.length / LIST.ITEM_PER_PAGE);
		const recital = new Recital(bot, msg);
		const pages = [...Array(pageCnt)].map((_, idx) => idx).map(pageIdx =>{
			const imageStr = items
				.slice(pageIdx * LIST.ITEM_PER_PAGE, (pageIdx + 1) * LIST.ITEM_PER_PAGE)
				.map(item => `${LIST.EMOJI[item.type]} ${item.name}`)
				.join('\n');
			const page = new EmbedPage()
				.setDescription(imageStr);
			return page;
		});

		recital.book.addPages(pages);
		recital.start(LIST.RECITAL_TIME);
	},
};
