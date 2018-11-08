const PERMISSION = require('@/constants/permission');
const { INVITE } = require('@/constants/command');


module.exports = {
	name: INVITE.CMD,
	description: INVITE.DESC,
	hidden: false,
	devOnly: false,
	permission: [
		PERMISSION.VIEW_CHANNEL,
		PERMISSION.SEND_MESSAGES,
	],
	execute: ({ bot, channel }) => {
		const botMention = bot.user.toString();
		bot.generateInvite(['ADMINISTRATOR'])
			.then(link => {
				channel.send(INVITE.MSG(botMention, link));
			});
	},
};
