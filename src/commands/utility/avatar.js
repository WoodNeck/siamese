const { MessageEmbed } = require('discord.js');
const COLOR = require('~/constants/color');
const ERROR = require('~/constants/error');
const PERMISSSION = require('~/constants/permission');
const { AVATAR } = require('~/constants/commands/utility');


module.exports = {
	name: AVATAR.CMD,
	description: AVATAR.DESC,
	usage: AVATAR.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSSION.ATTACH_FILES,
	],
	execute: async ({ msg, channel }) => {
		if (!msg.mentions.users.size) {
			await msg.error(ERROR.CMD.MENTION_NEEDED);
			return;
		}
		if (msg.mentions.users.size > 1) {
			await msg.error(ERROR.CMD.MENTION_ONLY_ONE);
			return;
		}
		channel.startTyping();

		const mentioned = msg.mentions.users.first();

		const embed = new MessageEmbed()
			.setImage(mentioned.avatarURL())
			.setFooter(mentioned.username, mentioned.avatarURL)
			.setColor(COLOR.BOT);

		channel.send(embed);
	},
};
