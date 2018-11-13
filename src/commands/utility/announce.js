const { RichEmbed } = require('discord.js');
const COLOR = require('@/constants/color');
const { ANNOUNCE } = require('@/constants/commands/utility');


module.exports = {
	name: ANNOUNCE.CMD,
	hidden: true,
	devOnly: true,
	permissions: [],
	execute: ({ bot, content }) => {
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
