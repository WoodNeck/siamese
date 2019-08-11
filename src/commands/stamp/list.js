const Directory = require('@/model/directory');
const Image = require('@/model/image');
const Recital = require('@/utils/recital');
const { EmbedPage } = require('@/utils/page');
const EMOJI = require('@/constants/emoji');
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

		const images = await Image.find({ guildId: guild.id, dirId: directory._id }).exec();
		const pageCnt = Math.ceil(images.length / LIST.IMAGE_PER_PAGE);
		const recital = new Recital(bot, msg);
		const pages = [...Array(pageCnt)].map((_, idx) => idx).map(pageIdx =>{
			const imageStr = images
				.slice(pageIdx * LIST.IMAGE_PER_PAGE, (pageIdx + 1) * LIST.IMAGE_PER_PAGE)
				.map(image => `${EMOJI.SMALL_WHITE_SQUARE} ${image.name}`)
				.join('\n');
			const page = new EmbedPage()
				.setDescription(imageStr);
			return page;
		});

		recital.book.addPages(pages);
		recital.start(LIST.RECITAL_TIME);
	},
};
