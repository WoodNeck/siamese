const prompt = require('@/utils/prompt');
const { MessageEmbed } = require('discord.js');
const COLOR = require('@/constants/color');
const EMOJI = require('@/constants/emoji');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { REPLY } = require('@/constants/commands/utility');


module.exports = {
	name: REPLY.CMD,
	hidden: true,
	devOnly: true,
	permissions: [],
	execute: async ({ bot, author, msg, content, channel }) => {
		if (!content) {
			msg.error(ERROR.CMD.EMPTY_CONTENT('길드_아이디/채널_아이디'));
			return;
		}
		const firstSpaceIndex = content.indexOf(' ');
		if (firstSpaceIndex < 0) {
			msg.error(ERROR.SAY.EMPTY_CONTENT);
		}
		const [guildId, channelId] = content.substring(0, firstSpaceIndex).split('/');
		const contentToSay = content.substring(firstSpaceIndex + 1);

		if (!guildId || !channelId) {
			msg.error(ERROR.CMD.EMPTY_CONTENT('길드_아이디/채널_아이디'));
			return;
		}

		const embedContent = new MessageEmbed()
			.setAuthor(author.user.username, author.user.avatarURL())
			.setDescription(`${contentToSay}\n\n\`${EMOJI.WRENCH}개발서버\`에서 보냈습니다. ${global.env.BOT_DEV_SERVER_INVITE}`)
			.setColor(COLOR.ERROR);

		const willSend = await prompt(embedContent, channel, author, REPLY.PROMPT_TIME);
		if (!willSend) return;

		const targetGuild = await bot.guilds.fetch(guildId);
		const targetChannel = targetGuild && await targetGuild.channels.fetch(channelId);
		if (!targetGuild || !targetChannel) {
			msg.error(ERROR.CMD.NOT_FOUND('길드 혹은 채널'));
			return;
		}


		if (!targetChannel.permissionsFor(bot.user).has(PERMISSION.SEND_MESSAGES.flag)) {
			msg.error(ERROR.CMD.PERMISSION_FAILED(PERMISSION.SEND_MESSAGES.message));
			return;
		}

		targetChannel.send(embedContent);
	},
};
