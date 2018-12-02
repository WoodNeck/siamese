const prompt = require('@/utils/prompt');
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
	execute: async ({ bot, author, msg, content, channel }) => {
		if (!content) {
			msg.error(ERROR.SAY.EMPTY_CONTENT);
			return;
		}
		const embedContent = new RichEmbed()
			.setTitle(ANNOUNCE.MESSAGE_TITLE)
			.setDescription(content)
			.setColor(COLOR.BOT);
		const textContent = dedent`
			${ANNOUNCE.MESSAGE_TITLE}
			${content}`;

		const willSend = await prompt(embedContent, channel, author, ANNOUNCE.PROMPT_TIME);
		if (!willSend) return;

		const guilds = bot.guilds
			.filter(guild => guild.systemChannel);
		guilds.tap(guild => {
			const permissionsGranted = guild.systemChannel.permissionsFor(bot.user);
			const announce = permissionsGranted.has(PERMISSION.EMBED_LINKS.flag)
				? embedContent
				: textContent;
			guild.systemChannel.send(announce);
		});
	},
};
