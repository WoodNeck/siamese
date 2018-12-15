const { RichEmbed } = require('discord.js');
const Recital = require('@/utils/recital');
const Command = require('@/model/command');
const { EmbedPage } = require('@/utils/page');
const COLOR = require('@/constants/color');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { STATS } = require('@/constants/commands/bot');
const { COOLDOWN } = require('@/constants/type');


module.exports = {
	name: STATS.CMD,
	description: STATS.DESC,
	usage: STATS.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
		PERMISSION.ADD_REACTIONS,
		PERMISSION.MANAGE_MESSAGES,
	],
	cooldown: COOLDOWN.PER_GUILD(5),
	execute: async ({ bot, msg, channel, guild, content }) => {
		await channel.startTyping();

		// Specific command check
		if (content) {
			const cmd = await Command.findOne({
				name: content,
			}).exec();

			if (!cmd) {
				await msg.error(ERROR.STATS.NO_ENTRY);
				return;
			}

			const embed = new RichEmbed()
				.setAuthor(STATS.TITLE(content), bot.user.avatarURL)
				.setDescription(STATS.CMD_INFO(cmd))
				.setColor(COLOR.BOT);
			channel.send(embed);
		}
		// All command check
		else {
			const commands = await Command.find()
				.sort({ callCount: -1 })
				.exec();

			if (!commands.length) {
				await msg.error(ERROR.STATS.NOT_EXECUTED_ONCE);
				return;
			}

			const recital = new Recital(bot, msg);
			const pages = [];
			for (let i = 0; i < commands.length / STATS.CMD_PER_PAGE; i += 1) {
				const page = new EmbedPage()
					.setAuthor(STATS.TITLE(bot.getNameIn(guild)), bot.user.avatarURL);
				const commandsInfo = commands.slice(i * STATS.CMD_PER_PAGE, (i + 1) * STATS.CMD_PER_PAGE)
					.map(cmd => STATS.CMD_INFO_ONE_LINE(cmd))
					.join('\n');
				page.setDescription(commandsInfo);
				pages.push(page);
			}
			recital.book.addPages(pages);
			recital.start(STATS.RECITAL_TIME);
		}
	},
};
