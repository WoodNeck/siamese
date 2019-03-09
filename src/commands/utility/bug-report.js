const prompt = require('@/utils/prompt');
const { MessageEmbed } = require('discord.js');
const COLOR = require('@/constants/color');
const ERROR = require('@/constants/error');
const { BUG_REPORT } = require('@/constants/commands/utility');
const { COOLDOWN } = require('@/constants/type');


module.exports = {
	name: BUG_REPORT.CMD,
	description: BUG_REPORT.DESC,
	usage: BUG_REPORT.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [],
	cooldown: COOLDOWN.PER_USER(30),
	execute: async ({ bot, msg, author, channel, guild, content }) => {
		if (!content) {
			msg.error(ERROR.CMD.EMPTY_CONTENT(BUG_REPORT.TARGET));
			return;
		}

		const bugChannel = bot.channels.get(global.env.BOT_BUG_REPORT_CHANNEL);
		const embed = new MessageEmbed()
			.setTitle(BUG_REPORT.TITLE_CONFIRM)
			.setDescription(content)
			.setColor(COLOR.BOT);

		const willSend = await prompt(embed, channel, author, BUG_REPORT.PROMPT_TIME);
		if (!willSend) {
			channel.send(BUG_REPORT.MSG_CANCEL);
			return;
		}

		embed.title = undefined;
		embed.setAuthor(`${author.user.username}(${author.user.id})`, author.user.avatarURL());
		embed.setFooter(`${guild.name}(${guild.id})`, guild.iconURL());

		await bugChannel.send(embed);
		channel.send(BUG_REPORT.MSG_SUCCESS);
	},
};
