const { MessageEmbed } = require('discord.js');
const Directory = require('@/model/directory');
const Recital = require('@/utils/recital');
const { EmbedPage } = require('@/utils/page');
const EMOJI = require('@/constants/emoji');
const COLOR = require('@/constants/color');
const { LIST } = require('@/constants/commands/file');

module.exports = async (bot, msg) => {
	if (!msg.guild) return;

	const guildId = msg.guild.id;
	const dirName = msg.content.split(/ +/)[0];
	const fileName = msg.content.slice(dirName.length + 1).trim();
	if (!dirName | !fileName) {
		return;
	}

	const directory = await Directory.findOne({
		name: dirName,
		guildId,
	}).exec();

	// Due to rest api change
	if (!directory || !directory.images) {
		return;
	}

	const images = directory.images;

	if (fileName === LIST.CMD) {
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
		return;
	}

	const image = images.find(img => img.name === fileName);

	if (image) {
		msg.channel.send(
			new MessageEmbed()
				.setImage(image.url)
				.setColor(COLOR.BOT)
		);
	}
};
