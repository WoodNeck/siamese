const { RichEmbed } = require('discord.js');
const Recital = require('@/utils/recital');
const GuildCommand = require('@/model/guildcommand');
const { EmbedPage } = require('@/utils/page');
const COLOR = require('@/constants/color');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { STATS, GUILDSTATS } = require('@/constants/commands/bot');
const { COOLDOWN } = require('@/constants/type');


module.exports = {
	name: GUILDSTATS.CMD,
	description: GUILDSTATS.DESC,
	usage: GUILDSTATS.USAGE,
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
			const cmd = await GuildCommand.findOne({
				name: content,
			}).exec();

			if (!cmd) {
				await msg.error(ERROR.STATS.NO_ENTRY);
				return;
			}

			const embed = new RichEmbed()
				.setAuthor(STATS.TITLE(content), guild.iconURL)
				.setDescription(GUILDSTATS.CMD_INFO(cmd))
				.setColor(COLOR.BOT);
			channel.send(embed);
		}
		// All command check
		else {
			const commands = await GuildCommand.find()
				.sort({ callCount: -1 })
				.exec();

			const recital = new Recital(bot, msg);
			const pages = [];
			for (let i = 0; i < commands.length / STATS.CMD_PER_PAGE; i += 1) {
				const page = new EmbedPage()
					.setAuthor(STATS.TITLE(bot.getNameIn(guild)), guild.iconURL);
				const commandsInfo = commands.slice(i * STATS.CMD_PER_PAGE, (i + 1) * STATS.CMD_PER_PAGE)
					.map(cmd => GUILDSTATS.CMD_INFO_ONE_LINE(cmd))
					.join('\n');
				page.setDescription(commandsInfo);
				pages.push(page);
			}
			recital.book.addPages(pages);
			recital.start(STATS.RECITAL_TIME);
		}
	},
};
