const { MessageEmbed } = require('discord.js');
const Directory = require('@/model/directory');
const COLOR = require('@/constants/color');

module.exports = async msg => {
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

	if (!directory) {
		return;
	}

	const images = directory.images;
	const image = images.find(img => img.name === fileName);

	if (image) {
		msg.channel.send(
			new MessageEmbed()
				.setImage(image.url)
				.setColor(COLOR.BOT)
		);
	}
};
