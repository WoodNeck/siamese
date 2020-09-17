const { MessageEmbed } = require('discord.js');
const Recital = require('~/utils/recital');
const Command = require('~/model/command');
const { EmbedPage } = require('~/utils/page');
const COLOR = require('~/constants/color');
const ERROR = require('~/constants/error');
const PERMISSION = require('~/constants/permission');
const { DAILYSTATS } = require('~/constants/commands/bot');
const { COOLDOWN } = require('~/constants/type');


module.exports = {
	name: DAILYSTATS.CMD,
	description: DAILYSTATS.DESC,
	usage: DAILYSTATS.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
		PERMISSION.ADD_REACTIONS,
		PERMISSION.MANAGE_MESSAGES,
	],
	cooldown: COOLDOWN.PER_GUILD(5),
	execute: async ({ bot, msg, channel, guild, content }) => {
		channel.startTyping();

		// Specific command check
		if (content) {
			const cmd = await Command.findOne({
				name: content,
				time: new Date().toDateString(),
			}).exec();

			if (!cmd) {
				await msg.error(ERROR.STATS.NO_ENTRY);
				return;
			}

			const embed = new MessageEmbed()
				.setAuthor(DAILYSTATS.TITLE(content), bot.user.avatarURL())
				.setDescription(DAILYSTATS.CMD_INFO(cmd))
				.setColor(COLOR.BOT);
			channel.send(embed);
		}
		// All command check
		else {
			const commands = await Command.find({
				time: new Date().toDateString(),
			}).sort({ callCount: -1 })
				.exec();

			if (!commands.length) {
				await msg.error(ERROR.STATS.NOT_EXECUTED_ONCE);
				return;
			}

			const recital = new Recital(bot, msg);
			const pages = [];
			for (let i = 0; i < commands.length / DAILYSTATS.CMD_PER_PAGE; i += 1) {
				const page = new EmbedPage()
					.setAuthor(DAILYSTATS.TITLE(bot.getNameIn(guild)), bot.user.avatarURL());
				const commandsInfo = commands.slice(i * DAILYSTATS.CMD_PER_PAGE, (i + 1) * DAILYSTATS.CMD_PER_PAGE)
					.map(cmd => DAILYSTATS.CMD_INFO_ONE_LINE(cmd))
					.join('\n');
				page.setDescription(commandsInfo);
				pages.push(page);
			}
			recital.book.addPages(pages);
			recital.start(DAILYSTATS.RECITAL_TIME);
		}
	},
};
