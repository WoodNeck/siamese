const { RichEmbed } = require('discord.js');
const COLOR = require('@/constants/color');
const ERROR = require('@/constants/error');
const { ANNOUNCE } = require('@/constants/commands/utility');


module.exports = {
	name: ANNOUNCE.CMD,
	hidden: true,
	devOnly: true,
	permissions: [],
	execute: ({ bot, msg, content }) => {
		if (!content) {
			msg.error(ERROR.SAY.EMPTY_CONTENT);
			return;
		}
		const guilds = bot.guilds
			.filter(guild => guild.systemChannel);
		guilds.tap(guild => {
			const embed = new RichEmbed()
				.setTitle(ANNOUNCE.MESSAGE_TITLE)
				.setDescription(content)
				.setColor(COLOR.BOT);
			guild.systemChannel.send(embed);
		});
	},
};
