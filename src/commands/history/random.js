const { MessageEmbed } = require('discord.js');
const Channel = require('@/model/channel');
const COLOR = require('@/constants/color');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { RANDOM } = require('@/constants/commands/history');
const { MESSAGE_MAX_LENGTH } = require('@/constants/discord');


module.exports = {
	name: RANDOM.CMD,
	description: RANDOM.DESC,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
		PERMISSION.READ_MESSAGE_HISTORY,
	],
	execute: async ({ guild, channel, msg }) => {
		// Retrieve one msg from message history of channel
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
		const randomMsgs = await channel.messages.fetch({
			limit: RANDOM.MSG_FETCH_LIMIT,
			around: randomMsgId,
		}, false);

		const randomMsg = randomMsgs
			.filter(message => !message.author.bot)
			.random();

		if (!randomMsg) {
			msg.error(ERROR.RANDOM.CANT_FIND_MSG);
			return;
		}

		const embed = new MessageEmbed()
			.setAuthor(
				randomMsg.author.username,
				randomMsg.author.avatarURL(),
			)
			.setDescription(`
${randomMsg.content.substr(0, MESSAGE_MAX_LENGTH)}
${RANDOM.MSG_CHECK(RANDOM.MSG_URL(guild.id, channel.id, randomMsg.id))}`)
			.setColor(COLOR.BOT)
			.setTimestamp(randomMsg.createdTimestamp);
		if (randomMsg.attachments.size) {
			embed.setImage(randomMsg.attachments.random().url);
		}
		channel.send(embed);
	},
};
