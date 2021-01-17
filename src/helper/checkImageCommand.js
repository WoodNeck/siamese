const { MessageEmbed } = require('discord.js');
const Directory = require('~/model/directory');
const Image = require('~/model/image');
const COLOR = require('~/const/color');

module.exports = async (bot, msg) => {
	if (!msg.guild) return;

	const guildId = msg.guild.id;
	const msgSplitted = msg.content.split(/ +/);
	const dirName = msgSplitted[0];
	const fileName = msgSplitted[1];

	if (dirName && !fileName) {
		const image = await Image.findOne({
			name: dirName,
			dirId: 0,
			guildId,
		}).exec();
		if (!image) return;

		msg.channel.send(
			new MessageEmbed()
				.setImage(image.url)
				.setColor(COLOR.BOT)
		);
	}
	else if (dirName && fileName) {
		const directory = await Directory.findOne({
			name: dirName,
			guildId,
		}).exec();
		if (!directory) return;

		const image = await Image.findOne({
			name: fileName,
			dirId: directory._id,
		}).exec();
		if (!image) return;

		msg.channel.send(
			new MessageEmbed()
				.setImage(image.url)
				.setColor(COLOR.BOT)
		);
	}
};
