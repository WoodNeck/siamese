const prompt = require('~/utils/prompt');
const { MessageEmbed } = require('discord.js');
const dedent = require('~/utils/dedent');
const Guild = require('~/model/guild');
const COLOR = require('~/const/color');
const ERROR = require('~/const/error');
const PERMISSION = require('~/const/permission');
const { ANNOUNCE } = require('~/const/commands/utility');


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
		const embedContent = new MessageEmbed()
			.setTitle(ANNOUNCE.MESSAGE_TITLE)
			.setDescription(`${content}\n\n${ANNOUNCE.FOOTER}`)
			.setColor(COLOR.BOT)
			.setFooter(author.user.tag, author.user.avatarURL());
		const textContent = dedent`
			${ANNOUNCE.MESSAGE_TITLE}
			${content}`;

		const willSend = await prompt(embedContent, channel, author, ANNOUNCE.PROMPT_TIME);
		if (!willSend) return;

		const guildSettings = await Guild.find().exec();

		const guilds = bot.guilds.cache;
		guilds.forEach(async guild => {
			const setting = guildSettings.find(el => el.id === guild.id);
			if (setting && !setting.listenAnnounce) return;

			let channelToSend = guild.systemChannel;
			if (setting && setting.announceChannel) {
				channelToSend = await guild.channels.fetch(setting.announceChannel);
			}
			// Fallback, get first channel that bot can send message
			if (!channelToSend) {
				channelToSend = guild.channels.cache
					.filter(guildChannel => guildChannel.type === 'text')
					.filter(guildChannel => guildChannel.permissionsFor(bot.user).has(PERMISSION.SEND_MESSAGES.flag))
					.first();
			}

			// Don't send message if there's no channel to send
			if (!channelToSend) return;

			const permissionsGranted = channelToSend.permissionsFor(bot.user);
			const announce = permissionsGranted.has(PERMISSION.EMBED_LINKS.flag)
				? embedContent
				: textContent;
			channelToSend.send(announce);
		});
	},
};
