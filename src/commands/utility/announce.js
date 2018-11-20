const { RichEmbed } = require('discord.js');
const dedent = require('@/utils/dedent');
const COLOR = require('@/constants/color');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
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
			const permissionsGranted = guild.systemChannel.permissionsFor(bot.user);
			const announce = permissionsGranted.has(PERMISSION.EMBED_LINKS.flag)
				? new RichEmbed()
					.setTitle(ANNOUNCE.MESSAGE_TITLE)
					.setDescription(content)
					.setColor(COLOR.BOT)
				: dedent`
					${ANNOUNCE.MESSAGE_TITLE}
					${content}`;
			guild.systemChannel.send(announce);
		});
	},
};
