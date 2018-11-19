const { RichEmbed } = require('discord.js');
const Channel = require('@/model/channel');
const COLOR = require('@/constants/color');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { RANDOM } = require('@/constants/commands/history');


module.exports = {
	name: RANDOM.CMD,
	description: RANDOM.DESC,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
	],
	execute: async ({ channel, msg }) => {
		const randomLog = await Channel.aggregate([
			{ $match: { id: channel.id } },
			{ $unwind: '$msgs.snowflakes' },
			{ $sample: { 'size': 1 } },
		]).exec();
		if (!randomLog.length) {
			msg.error(ERROR.RANDOM.NO_ENTRY_FOUND);
			return;
		}
		const randomMsgId = randomLog[0].msgs.snowflakes;
		const randomMsgs = await channel.fetchMessages({
			limit: RANDOM.MSG_FETCH_LIMIT,
			before: randomMsgId,
		});

		const randomMsg = randomMsgs
			.filter(message => !message.author.bot)
			.random();

		if (!randomMsg) {
			msg.error(ERROR.RANDOM.CANT_FIND_MSG);
			return;
		}

		const embed = new RichEmbed()
			.setAuthor(randomMsg.author.username, randomMsg.author.avatarURL)
			.setDescription(randomMsg.content)
			.setColor(COLOR.BOT)
			.setTimestamp(randomMsg.createdTimestamp);
		if (randomMsg.attachments.size) {
			embed.setImage(randomMsg.attachments.random().url);
		}
		channel.send(embed);
	},
};
