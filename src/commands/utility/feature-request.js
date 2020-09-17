const prompt = require('~/utils/prompt');
const { MessageEmbed } = require('discord.js');
const COLOR = require('~/constants/color');
const ERROR = require('~/constants/error');
const { FEATURE_REQUEST } = require('~/constants/commands/utility');
const { COOLDOWN } = require('~/constants/type');


module.exports = {
	name: FEATURE_REQUEST.CMD,
	description: FEATURE_REQUEST.DESC,
	usage: FEATURE_REQUEST.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [],
	cooldown: COOLDOWN.PER_USER(30),
	execute: async ({ bot, msg, author, channel, guild, content }) => {
		if (!content) {
			msg.error(ERROR.CMD.EMPTY_CONTENT(FEATURE_REQUEST.TARGET));
			return;
		}

		const featureChannel = await bot.channels.fetch(global.env.BOT_FEATURE_REQUEST_CHANNEL);

		const embed = new MessageEmbed()
			.setTitle(FEATURE_REQUEST.TITLE_CONFIRM)
			.setDescription(content)
			.setColor(COLOR.BOT);

		const willSend = await prompt(embed, channel, author, FEATURE_REQUEST.PROMPT_TIME);
		if (!willSend) {
			channel.send(FEATURE_REQUEST.MSG_CANCEL);
			return;
		}

		embed.title = undefined;
		embed.setAuthor(`${author.user.username}(${author.user.id})`, author.user.avatarURL());
		embed.setFooter(`${guild.name}(${guild.id}/${channel.id})`, guild.iconURL());

		featureChannel.send(embed);
	},
};
